#!/usr/bin/env node

/**
 * Programmatic SEO pipeline (service x city only).
 *
 * Mixes:
 *   - src/data/taxonomy/skills.json     (scope = local | remote | both)
 *   - src/data/taxonomy/locations.json  (state/city pairs)
 *
 * Rules:
 *   - local / both  -> /{service}/{state}/{city}   (state is part of the path/breadcrumb,
 *                       but there are NO separate service x state landing pages)
 *   - remote        -> /{service}   (no location)
 *
 * Outputs (materialized):
 *   - public/sitemaps/sitemap-remote.xml            remote service pages
 *   - public/sitemaps/sitemap-local-{service}.xml   one per local service (its city pages)
 *   - public/sitemaps/sitemap-index.xml             index of all of the above
 *   - src/data/taxonomy/seo_index.json        compact spec for the app/router
 *
 * NOTE: this materializes ~ (local services x cities) URLs and is LARGE.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEB = path.resolve(__dirname, '..', '..');
const TAX = path.join(WEB, 'src', 'data', 'taxonomy');
const OUT = path.join(WEB, 'public', 'sitemaps');
const BASE = 'https://freesurf.tools';

fs.mkdirSync(OUT, { recursive: true });

const skills = JSON.parse(fs.readFileSync(path.join(TAX, 'skills.json'), 'utf8')).skills;
const locations = JSON.parse(fs.readFileSync(path.join(TAX, 'locations.json'), 'utf8')).locations;
// Abbreviation -> name slug. The route `/{service}/{state}/{city}` matches the
// state NAME slug (`/handyman/alaska/anchorage/`), NOT the abbreviation. Using
// the raw `l.state` here produced /handyman/ak/anchorage/ for every city, and
// every one of those 307-redirects to the homepage.
const states = JSON.parse(fs.readFileSync(path.join(TAX, 'states.json'), 'utf8'));
const stateSlugByAbbr = new Map(states.map((s) => [s.abbr.toLowerCase(), s.slug]));

const localServices = skills.filter((s) => s.scope === 'local' || s.scope === 'both');
const remoteServices = skills.filter((s) => s.scope === 'remote');

const today = new Date().toISOString().split('T')[0];

function writeUrlset(file, urls, priority) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const loc of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  fs.writeFileSync(path.join(OUT, file), xml);
  return urls.length;
}

// Remote service pages: /{service}
const remoteUrls = remoteServices.map((s) => `${BASE}/${s.slug}/`);
const remoteCount = writeUrlset('sitemap-remote.xml', remoteUrls, '0.7');

// Local service x city pages, one sitemap per service.
const localFiles = [];
let localTotal = 0;
let skippedUnknownState = 0;
for (const s of localServices) {
  const urls = [];
  for (const l of locations) {
    const stateSlug = stateSlugByAbbr.get(String(l.state).toLowerCase());
    if (!stateSlug) {
      skippedUnknownState++;
      continue;
    }
    urls.push(`${BASE}/${s.slug}/${stateSlug}/${l.city}/`);
  }
  localTotal += writeUrlset(`sitemap-local-${s.slug}.xml`, urls, '0.6');
  localFiles.push(`sitemap-local-${s.slug}.xml`);
}
if (skippedUnknownState > 0) {
  console.warn(`  WARNING: skipped ${skippedUnknownState} locations with an unknown state abbreviation`);
}

// Sitemap index
let index = '<?xml version="1.0" encoding="UTF-8"?>\n';
index += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const f of ['sitemap-remote.xml', ...localFiles]) {
  index += '  <sitemap>\n';
  index += `    <loc>${BASE}/sitemaps/${f}</loc>\n`;
  index += `    <lastmod>${today}</lastmod>\n`;
  index += '  </sitemap>\n';
}
index += '</sitemapindex>\n';
fs.writeFileSync(path.join(OUT, 'sitemap-index.xml'), index);

// Compact spec for the app
const seoIndex = {
  generated: today,
  rules: {
    local: '/{service}/{state}/{city}',
    remote: '/{service}',
  },
  counts: {
    localServices: localServices.length,
    remoteServices: remoteServices.length,
    cityPairs: locations.length,
    localCityPages: localTotal,
    remotePages: remoteCount,
  },
  remoteServices: remoteServices.map((s) => s.slug),
  localServices: localServices.map((s) => s.slug),
};
fs.writeFileSync(path.join(TAX, 'seo_index.json'), JSON.stringify(seoIndex, null, 2));

console.log('remote service pages:', remoteCount);
console.log('local services:', localServices.length);
console.log('city pairs:', locations.length);
console.log('local service x city pages:', localTotal);
console.log('sitemap files written:', 1 + localFiles.length + 1);
