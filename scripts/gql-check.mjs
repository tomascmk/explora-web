/**
 * Gate de contratos GraphQL — implementacion compartida por explora-app,
 * explora-web y explora-admin. Este archivo es identico en los tres repos
 * (PLAN-071 lo introdujo, PLAN-074 lo corrigio, PLAN-075 lo unifico): si lo
 * tocas en uno, copialo a los otros dos.
 *
 * Valida TODAS las operaciones del repo contra el schema real de explora-api.
 * TypeScript no ve dentro de los template literals y los tests mockean el
 * cliente GraphQL, asi que sin esto un campo inexistente pasa lint, tsc y los
 * tests: es exactamente como entraron los bugs de PLAN-071 §1 y PLAN-074 §2.
 *
 * Tres detalles que costaron falsos positivos y conviene no revertir:
 *   1. El mapa de constantes es DE PROYECTO, no por archivo: hay repos que
 *      definen los fragmentos en un modulo y los importan desde otro, y
 *      resolverlos por archivo deja cada `${FRAGMENT}` sin sustituir.
 *   2. La resolucion es RECURSIVA y se aplica sobre el mapa YA FUSIONADO. Los
 *      fragmentos interpolan otros fragmentos; y fusionar el mapa local
 *      *despues* del global pisa las constantes ya resueltas con las crudas,
 *      dejando un `$` suelto que el parser reporta como "Unexpected $".
 *   3. Los fragmentos se DEDUPLICAN por nombre al armar el documento: si dos
 *      fragmentos interpolados embeben un tercero, queda definido dos veces y
 *      graphql-js protesta con "There can be only one fragment named X".
 *
 * El schema vive vendorizado en `graphql/schema.gql`; se refresca con
 * `pnpm gql:sync` desde el repo de la API (que lo versiona y tiene su propio
 * gate anti-drift).
 *
 * Los archivos `*.test.*` quedan FUERA del scan a proposito: sus documentos
 * inline suelen ser andamiaje sintetico (queries dummy para ejercitar el link
 * chain o las type policies del cache), no contratos con la API. Los contratos
 * de verdad viven en `graphql/`, `services/` y `lib/`, que si se escanean. El
 * conteo de salteados se imprime para que la exclusion quede visible.
 *
 * Uso: node scripts/gql-check.mjs [repoDir] [schemaPath]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSchema, parse, validate } from "graphql";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.argv[2] || path.resolve(here, "..");
const SCHEMA_PATH = process.argv[3] || path.join(REPO, "graphql", "schema.gql");

const schema = buildSchema(fs.readFileSync(SCHEMA_PATH, "utf8"));

// Union de los tres repos (app / web / admin) para que este archivo sea
// literalmente el mismo en los tres. PLAN-075.
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".expo",
  "coverage",
  "dist",
  "build",
  "android",
  "ios",
  "test-results",
]);

let skippedTests = 0;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(test|spec)\.tsx?$/.test(e.name)) skippedTests++;
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

// Constantes string del archivo (ej. `const EVENT_FRAGMENT = gql\`...\``), para
// poder resolver las interpolaciones `${EVENT_FRAGMENT}` dentro de las queries.
function collectStringConsts(src) {
  const consts = {};
  const re = /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:gql\s*)?`/g;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    let buf = "";
    while (i < src.length) {
      if (src[i] === "\\") {
        buf += src[i] + src[i + 1];
        i += 2;
        continue;
      }
      if (src[i] === "`") break;
      buf += src[i];
      i++;
    }
    consts[m[1]] = buf;
  }
  return consts;
}

// Neutraliza comentarios para que un `gql` mencionado en prosa no se tome como
// operacion (varios docs del repo escriben "el helper `gql`").
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (s) => s.replace(/[^\n]/g, " "))
    .replace(/^[ \t]*\/\/.*$/gm, (s) => s.replace(/[^\n]/g, " "));
}

function extractGqlBlocks(src, consts) {
  const blocks = [];
  const re = /\bgql\s*(?:<[^>]*>)?\s*[`(]/g;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    if (m[0].endsWith("(")) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src[i] !== "`") continue; // no es un literal inline: se ignora
      i++;
    }
    let buf = "";
    while (i < src.length) {
      const c = src[i];
      if (c === "\\") {
        buf += src[i] + src[i + 1];
        i += 2;
        continue;
      }
      if (c === "$" && src[i + 1] === "{") {
        let depth = 1;
        i += 2;
        const start = i;
        while (i < src.length && depth > 0) {
          if (src[i] === "{") depth++;
          else if (src[i] === "}") depth--;
          i++;
        }
        const expr = src.slice(start, i - 1).trim();
        buf += consts[expr] !== undefined ? consts[expr] : "__UNRESOLVED__";
        continue;
      }
      if (c === "`") break;
      buf += c;
      i++;
    }
    blocks.push({ text: buf, index: m.index });
  }
  return blocks;
}

const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

const files = walk(REPO);

// (2) Resolucion recursiva de fragmentos que interpolan fragmentos.
// Ojo: hay que correrla sobre el mapa YA fusionado. Resolver solo el global y
// despues pisarlo con las constantes crudas del archivo devuelve los `${...}`
// sin sustituir y el parser tira "Unexpected $".
function resolveConsts(map) {
  const out = { ...map };
  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    for (const [k, v] of Object.entries(out)) {
      const resolved = v.replace(/\$\{([^}]+)\}/g, (m, expr) => {
        const key = expr.trim();
        return out[key] !== undefined ? out[key] : m;
      });
      if (resolved !== v) {
        out[k] = resolved;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return out;
}

// (1) Mapa de constantes de proyecto — ver cabecera.
const RAW_CONSTS = {};
for (const f of files) {
  Object.assign(RAW_CONSTS, collectStringConsts(fs.readFileSync(f, "utf8")));
}

// Primera pasada: juntar los fragmentos del repo para poder validar operaciones
// que los referencian por interpolacion.
const allFragments = [];
for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const consts = resolveConsts({ ...RAW_CONSTS, ...collectStringConsts(raw) });
  for (const b of extractGqlBlocks(stripComments(raw), consts)) {
    if (!/\bfragment\s+\w+\s+on\b/.test(b.text)) continue;
    try {
      for (const d of parse(b.text).definitions) {
        if (
          d.kind === "FragmentDefinition" &&
          !allFragments.some((x) => x.name.value === d.name.value)
        )
          allFragments.push(d);
      }
    } catch {
      /* el error se reporta en la pasada de abajo */
    }
  }
}

const findings = [];
let opCount = 0;
let fileCount = 0;

for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const src = stripComments(raw);
  const consts = resolveConsts({ ...RAW_CONSTS, ...collectStringConsts(raw) });
  const blocks = extractGqlBlocks(src, consts);
  if (blocks.length) fileCount++;
  for (const b of blocks) {
    const rel = path.relative(REPO, f);
    const line = lineOf(src, b.index);
    let doc;
    try {
      doc = parse(b.text);
    } catch (e) {
      findings.push({ file: rel, line, kind: "PARSE", op: "-", msg: e.message.split("\n")[0] });
      continue;
    }
    const ops = doc.definitions.filter((d) => d.kind === "OperationDefinition");
    opCount += ops.length;
    const opName =
      ops.map((o) => o.name?.value || "(anonima)").join(",") || "(solo fragmentos)";

    // Dedup por nombre: si dos fragmentos interpolados embeben un tercero, el
    // documento termina con dos definiciones identicas y graphql-js protesta
    // con "There can be only one fragment named X" — un artefacto del inlining,
    // no un problema del codigo.
    const seenFrags = new Set();
    const definitions = [];
    for (const d of [...doc.definitions, ...allFragments]) {
      if (d.kind === "FragmentDefinition") {
        if (seenFrags.has(d.name.value)) continue;
        seenFrags.add(d.name.value);
      }
      definitions.push(d);
    }
    const merged = { kind: "Document", definitions };

    let errors;
    try {
      errors = validate(schema, merged);
    } catch (e) {
      findings.push({ file: rel, line, kind: "VALIDATE-CRASH", op: opName, msg: e.message });
      continue;
    }
    for (const err of errors) {
      // "fragmento nunca usado" es ruido de haberlos inyectado a todos.
      if (/is never used/.test(err.message)) continue;
      findings.push({ file: rel, line, kind: "SCHEMA", op: opName, msg: err.message });
    }
  }
}

console.log(`\n### ${path.basename(REPO)} — contratos GraphQL`);
console.log(
  `archivos con gql: ${fileCount} | operaciones: ${opCount} | tests salteados: ${skippedTests} | hallazgos: ${findings.length}\n`,
);
const byFile = {};
for (const f of findings) (byFile[f.file] ||= []).push(f);
for (const [file, list] of Object.entries(byFile)) {
  console.log(`  ${file}`);
  for (const x of list) console.log(`    L${x.line} [${x.kind}] ${x.op}: ${x.msg}`);
}
if (!findings.length) console.log("  ✅ sin hallazgos");

process.exit(findings.length ? 1 : 0);
