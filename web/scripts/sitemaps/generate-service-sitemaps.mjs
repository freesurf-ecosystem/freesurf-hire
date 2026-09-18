#!/usr/bin/env node

/**
 * Sitemap generation.
 *
 * Two modes, driven by src/config/seo.json (the same file the app reads for its
 * robots meta tags, so the two can't disagree):
 *
 *   quarantine on (default)  One small public/sitemap.xml containing the static
 *                            pages, the legal pages, and the remote service
 *                            pages. Local city/zip pages are excluded because
 *                            they are noindexed and empty.
 *
 *   quarantine off           Also materialises the full local set: one
 *                            sitemap-local-{service}.xml per local service
 *                            (~13,400 city URLs each) plus sitemap-index.xml.
 *                            That is ~7M URLs / ~1.2 GB - only do it when there
 *                            is real inventory behind those pages.
 *
 * Inputs:
 *   - src/data/taxonomy/skills.json     (scope = local | remote | both)
 *   - src/data/taxonomy/locations.json  (state/city pairs, state = abbreviation)
 *   - src/data/taxonomy/states.json     (abbreviation -> name slug)
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

const seo = JSON.parse(fs.readFileSync(path.join(WEB, 'src', 'config', 'seo.json'), 'utf8'));

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

function urlEntry(loc, changefreq, priority) {
  return (
    '  <url>\n' +
    `    <loc>${loc}</loc>\n` +
    `    <lastmod>${today}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    '  </url>\n'
  );
}

function writeUrlset(file, entries, outDir = OUT) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const e of entries) xml += urlEntry(e.loc, e.changefreq, e.priority);
  xml += '</urlset>\n';
  fs.writeFileSync(path.join(outDir, file), xml);
  return entries.length;
}

// ── Static + legal pages ───────────────────────────────────────────────────────
const entries = [
  { loc: `${BASE}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${BASE}/join-as-contractor/`, changefreq: 'weekly', priority: '0.9' },
  { loc: `${BASE}/resources/`, changefreq: 'weekly', priority: '0.7' },
  { loc: `${BASE}/support/`, changefreq: 'monthly', priority: '0.4' },
  // NOTE: no trailing slash. The legal pages are static HTML served via
  // next.config rewrites, and in production `/terms/` 307-redirects to `/terms`
  // (the opposite of `next dev`, where trailingSlash adds the slash). A sitemap
  // must list the URL that returns 200, so this matches production.
  { loc: `${BASE}/privacy`, changefreq: 'yearly', priority: '0.3' },
  { loc: `${BASE}/terms`, changefreq: 'yearly', priority: '0.3' },
  { loc: `${BASE}/eula`, changefreq: 'yearly', priority: '0.3' },
];

// ── Remote service pages: /{service} ───────────────────────────────────────────
let remoteCount = 0;
if (seo.sitemapIncludeRemoteServices) {
  for (const s of remoteServices) {
    entries.push({ loc: `${BASE}/${s.slug}/`, changefreq: 'monthly', priority: '0.6' });
    remoteCount++;
  }
}

const total = writeUrlset('sitemap.xml', entries, path.join(WEB, 'public'));

// ── Local service x city pages (quarantined by default) ────────────────────────
let localTotal = 0;
let localFiles = [];
if (seo.sitemapIncludeLocalPages) {
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
    localTotal += writeUrlset(
      `sitemap-local-${s.slug}.xml`,
      urls.map((loc) => ({ loc, changefreq: 'monthly', priority: '0.6' }))
    );
    localFiles.push(`sitemap-local-${s.slug}.xml`);
  }
  if (skippedUnknownState > 0) {
    console.warn(`  WARNING: skipped ${skippedUnknownState} locations with an unknown state abbreviation`);
  }

  let index = '<?xml version="1.0" encoding="UTF-8"?>\n';
  index += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const f of ['sitemap.xml', ...localFiles]) {
    index += '  <sitemap>\n';
    index += `    <loc>${BASE}/sitemaps/${f}</loc>\n`;
    index += `    <lastmod>${today}</lastmod>\n`;
    index += '  </sitemap>\n';
  }
  index += '</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT, 'sitemap-index.xml'), index);
}

// ── Compact spec for the app ───────────────────────────────────────────────────
const seoIndex = {
  generated: today,
  quarantine: {
    localPages: !seo.sitemapIncludeLocalPages,
    remoteServicePages: !seo.sitemapIncludeRemoteServices,
  },
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
    sitemapUrls: total,
  },
  remoteServices: remoteServices.map((s) => s.slug),
  localServices: localServices.map((s) => s.slug),
};
fs.writeFileSync(path.join(TAX, 'seo_index.json'), JSON.stringify(seoIndex, null, 2));

console.log('quarantine local pages:', !seo.sitemapIncludeLocalPages);
console.log('sitemap.xml urls:', total, `(remote service pages: ${remoteCount})`);
console.log('local services:', localServices.length);
console.log('city pairs:', locations.length);
console.log('local service x city pages:', localTotal);
console.log('sitemap files written:', 1 + (seo.sitemapIncludeLocalPages ? localFiles.length + 1 : 0));
