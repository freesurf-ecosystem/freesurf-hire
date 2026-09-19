// Builds the zipcode centroid table used by the service-area map picker.
//
// Source: US Census 2020 ZCTA gazetteer (public domain). One row per ZCTA with
// an internal point (INTPTLAT/INTPTLONG) - a representative point inside the
// area, which is what we want for "click near here, select this zipcode".
//
// Output is a compact array rather than GeoJSON: a FeatureCollection with 33k
// points costs ~3.3 MB of repeated key names, while [zip, lat, lon] costs about
// a third of that. Coordinates are rounded to 3 decimals (~110 m), which is far
// tighter than the precision of an internal point anyway.
//
// Usage: node scripts/geo/build-zip-centroids.mjs
// The result is committed, so a normal build does not need the network.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(HERE, '..', '..');
const OUT = path.join(WEB_ROOT, 'public', 'data', 'zip-centroids.json');

const GAZETTEER_URL =
  'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zip-centroids-'));
const zipPath = path.join(tmp, 'gazetteer.zip');

console.log('downloading gazetteer...');
execFileSync('curl', ['-sS', '--max-time', '180', '-o', zipPath, GAZETTEER_URL], { stdio: 'inherit' });

console.log('extracting...');
execFileSync('powershell', [
  '-NoProfile',
  '-Command',
  `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${tmp}' -Force`,
], { stdio: 'inherit' });

const txt = fs.readdirSync(tmp).find((f) => f.endsWith('.txt'));
if (!txt) throw new Error('no .txt found in the gazetteer archive');

const raw = fs.readFileSync(path.join(tmp, txt), 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);

const header = lines[0].split('\t').map((h) => h.trim());
const iGeo = header.indexOf('GEOID');
const iLat = header.indexOf('INTPTLAT');
const iLon = header.indexOf('INTPTLONG');
if (iGeo < 0 || iLat < 0 || iLon < 0) {
  throw new Error(`unexpected gazetteer columns: ${header.join(', ')}`);
}

const rows = [];
for (const line of lines.slice(1)) {
  const parts = line.split('\t');
  const zip = (parts[iGeo] || '').trim();
  const lat = parseFloat(parts[iLat]);
  const lon = parseFloat(parts[iLon]);
  if (!/^\d{5}$/.test(zip) || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  rows.push([zip, Math.round(lat * 1000) / 1000, Math.round(lon * 1000) / 1000]);
}

rows.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(rows), 'utf8');

console.log(`wrote ${rows.length} zipcode centroids`);
console.log(`  ${path.relative(WEB_ROOT, OUT)}  (${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB)`);

fs.rmSync(tmp, { recursive: true, force: true });
