/**
 * PLAN-071 §4 — Gate de contratos GraphQL.
 *
 * Valida TODAS las operaciones del repo contra el schema real de explora-api.
 * TypeScript no ve dentro de los template literals y los tests mockean Apollo,
 * asi que sin esto un campo inexistente pasa todos los gates: es exactamente
 * como entraron los bugs que arreglo PLAN-071 §1.
 *
 * El schema vive vendorizado en `graphql/schema.gql`; se refresca con
 * `pnpm gql:sync` desde el repo de la API (que lo versiona y tiene su propio
 * gate anti-drift).
 *
 * Uso: node scripts/gql-check.js [repoDir] [schemaPath]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSchema, parse, validate } from "graphql";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.argv[2] || path.resolve(here, "..");
const SCHEMA_PATH = process.argv[3] || path.join(REPO, "graphql", "schema.gql");

const schema = buildSchema(fs.readFileSync(SCHEMA_PATH, "utf8"));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      e.name === "node_modules" ||
      e.name === ".next" ||
      e.name === "coverage" ||
      e.name === ".git" ||
      e.name === "test-results"
    )
      continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

// Extrae operaciones en dos formas:
//   1. tagged template  -> gql`...`            (web, Apollo)
//   2. string argumento -> gql<T>(`...`)       (admin, cliente fetch propio)
// Maneja ${} de interpolación y backticks escapados.
// Constantes string del archivo (ej. const ACTIVITY_FIELDS = `id title ...`),
// para poder resolver las interpolaciones ${ACTIVITY_FIELDS} en las queries.
function collectStringConsts(src) {
  const consts = {};
  // Cubre `const X = \`...\`` (campos sueltos, patrón admin) y
  // `const X = gql\`...\`` (fragmentos, patrón web/Apollo).
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

// Neutraliza comentarios para que un `gql` mencionado en prosa no se tome
// como operación (los docs del repo escriben "el `gql` helper").
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
    // Forma 2: saltar hasta el backtick que abre el primer argumento.
    if (m[0].endsWith("(")) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src[i] !== "`") continue; // no es un literal inline: se ignora
      i++;
    }
    let depth = 0;
    let buf = "";
    while (i < src.length) {
      const c = src[i];
      if (c === "\\") {
        buf += src[i] + src[i + 1];
        i += 2;
        continue;
      }
      if (c === "$" && src[i + 1] === "{") {
        // Interpolación: resolvemos si es una constante string conocida del
        // archivo (patrón de admin: `{ ${ACTIVITY_FIELDS} }`); si no, la
        // sustituimos por __UNRESOLVED__ para no romper la sintaxis y poder
        // distinguir el caso en el reporte.
        depth = 1;
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

function lineOf(src, idx) {
  return src.slice(0, idx).split("\n").length;
}

const files = walk(REPO);
const findings = [];
let opCount = 0;
let fileCount = 0;

// Primera pasada: juntar todos los fragmentos definidos en el repo, para poder
// validar operaciones que los referencian por interpolación.
const allFragments = [];
for (const f of files) {
  const raw0 = fs.readFileSync(f, "utf8");
  for (const b of extractGqlBlocks(stripComments(raw0), collectStringConsts(raw0))) {
    if (!/\bfragment\s+\w+\s+on\b/.test(b.text)) continue;
    try {
      const doc = parse(b.text);
      for (const d of doc.definitions)
        if (
          d.kind === "FragmentDefinition" &&
          !allFragments.some((x) => x.name.value === d.name.value)
        )
          allFragments.push(d);
    } catch {
      /* se reporta abajo */
    }
  }
}

for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const src = stripComments(raw);
  const consts = collectStringConsts(raw);
  const blocks = extractGqlBlocks(src, consts);
  if (blocks.length) fileCount++;
  for (const b of blocks) {
    const rel = path.relative(REPO, f);
    const line = lineOf(src, b.index);
    let doc;
    try {
      doc = parse(b.text);
    } catch (e) {
      findings.push({
        file: rel,
        line,
        kind: "PARSE",
        op: "-",
        msg: e.message.split("\n")[0],
      });
      continue;
    }
    const ops = doc.definitions.filter((d) => d.kind === "OperationDefinition");
    opCount += ops.length;
    const opName = ops.map((o) => o.name?.value || "(anónima)").join(",") || "(solo fragmentos)";

    // Adjuntamos los fragmentos del repo que el doc no define localmente.
    const localFrags = new Set(
      doc.definitions.filter((d) => d.kind === "FragmentDefinition").map((d) => d.name.value),
    );
    const extra = allFragments.filter((fr) => !localFrags.has(fr.name.value));
    const merged = {
      kind: "Document",
      definitions: [...doc.definitions, ...extra],
    };

    let errors;
    try {
      errors = validate(schema, merged);
    } catch (e) {
      findings.push({ file: rel, line, kind: "VALIDATE-CRASH", op: opName, msg: e.message });
      continue;
    }
    for (const err of errors) {
      // Ignoramos "fragmento no usado": es ruido de haber inyectado todos.
      if (/is never used/.test(err.message)) continue;
      findings.push({ file: rel, line, kind: "SCHEMA", op: opName, msg: err.message });
    }
  }
}

console.log(`\n### ${path.basename(REPO)}`);
console.log(`archivos con gql: ${fileCount} | operaciones: ${opCount} | hallazgos: ${findings.length}\n`);
const byFile = {};
for (const f of findings) (byFile[f.file] ||= []).push(f);
for (const [file, fs_] of Object.entries(byFile)) {
  console.log(`  ${file}`);
  for (const x of fs_) console.log(`    L${x.line} [${x.kind}] ${x.op}: ${x.msg}`);
}
if (!findings.length) {
  console.log("  (sin hallazgos)");
} else {
  process.exitCode = 1;
}
