import seo from './seo.json';

/**
 * SEO gates for the programmatic landing pages.
 *
 * These live in seo.json so the sitemap generator
 * (scripts/sitemaps/generate-service-sitemaps.mjs) reads the same values -
 * otherwise the sitemap and the robots meta tags drift apart, which is worse
 * than either being wrong on its own.
 *
 * The two page families are gated separately on purpose:
 *
 *   /{service}                  remote services. These have real editorial
 *                               content (how it works, guarantees, FAQ), so
 *                               they are indexable now.
 *
 *   /{service}/{state}/{city}   local services x ~13,400 cities
 *   /{service}/{zip}            zipcode search results
 *                               ~6.98M URLs generated from the taxonomy rather
 *                               than from inventory. With no contractors they
 *                               are empty, and submitting millions of thin
 *                               pages gets a site assessed as low quality.
 *                               Quarantined until there is real content, then
 *                               unwound in batches.
 */
export const INDEX_REMOTE_SERVICE_PAGES = seo.indexRemoteServicePages;
export const INDEX_LOCAL_PAGES = seo.indexLocalPages;
export const SITEMAP_INCLUDE_REMOTE_SERVICES = seo.sitemapIncludeRemoteServices;
export const SITEMAP_INCLUDE_LOCAL_PAGES = seo.sitemapIncludeLocalPages;
