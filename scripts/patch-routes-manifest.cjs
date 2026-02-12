/**
 * Parchea .next/routes-manifest.json para incluir dataRoutes, dynamicRoutes y staticRoutes
 * si no existen. Next.js 15.5 a veces no escribe estos arrays en builds App Router-only,
 * lo que provoca "routesManifest.dataRoutes is not iterable" en next start.
 */
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', '.next', 'routes-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.warn('patch-routes-manifest: .next/routes-manifest.json no encontrado, omitiendo.');
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let changed = false;

if (!Array.isArray(manifest.dataRoutes)) {
  manifest.dataRoutes = [];
  changed = true;
}
if (!Array.isArray(manifest.dynamicRoutes)) {
  manifest.dynamicRoutes = [];
  changed = true;
}
if (!Array.isArray(manifest.staticRoutes)) {
  manifest.staticRoutes = [];
  changed = true;
}

if (changed) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 0));
  console.log('patch-routes-manifest: routes-manifest.json actualizado (dataRoutes/dynamicRoutes/staticRoutes).');
}
