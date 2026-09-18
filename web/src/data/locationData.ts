import { Location } from '../types';
import states from './taxonomy/states.json';

/**
 * Single source of truth for US states, shared with the sitemap generator
 * (scripts/sitemaps/generate-service-sitemaps.mjs reads the same JSON).
 *
 * This matters: the route `/{service}/{state}/{city}` matches the state NAME
 * slug (`/handyman/alaska/anchorage/`), NOT the abbreviation. A sitemap that
 * emitted `/handyman/ak/anchorage/` would 307-redirect every URL to the
 * homepage - millions of URLs pointing at one page.
 */
export const locations: Location[] = states.map((s, index) => ({
  id: String(index + 1),
  name: s.name,
  state: s.abbr,
}));

export const US_STATES = states.map(({ name, abbr }) => ({
  name,
  abbr,
}));

