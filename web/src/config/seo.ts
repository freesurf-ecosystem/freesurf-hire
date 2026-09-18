/**
 * SEO gates for the programmatic landing pages.
 *
 * The service pages are generated from the taxonomy, not from real inventory:
 *
 *   /{service}                      remote services
 *   /{service}/{state}/{city}       local services x ~13,400 cities
 *   /{service}/{zip}                zipcode search results
 *
 * That is ~6.98M URLs. With no contractors signed up they are empty, and
 * submitting millions of thin pages is a well-documented way to get a site
 * assessed as low quality - which is very hard to walk back.
 *
 * So they are noindexed for now, and should be unwound in batches once there is
 * enough real content (contractor profiles + supporting articles) to justify
 * indexing them. Set this to true when that's the case.
 *
 * Note: "noindex, follow" is used deliberately - the pages stay reachable and
 * link equity still flows, they just don't get indexed.
 */
export const INDEX_PROGRAMMATIC_PAGES = false;
