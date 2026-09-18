/**
 * Supabase connection values, resolved once for the whole app.
 *
 * Naming follows the rest of the FreeSurf ecosystem: the *publishable* key
 * (`sb_publishable_...`) is safe to ship to browsers and replaced the old
 * "anon" key. The *secret* key (`sb_secret_...`) replaced the old service-role
 * key and must NEVER be imported into client code — resolve it inline in
 * server-side API routes only.
 *
 * Legacy names are accepted as fallbacks so older env files keep working.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL || // server-side only (matches the worker repos)
  process.env.VITE_SUPABASE_URL ||
  '';

// NOTE: this MUST be a NEXT_PUBLIC_* name. Next.js only inlines NEXT_PUBLIC_*
// variables into the browser bundle — any other name (e.g. a bare
// PUBLIC_SUPABASE_PUBLIC_KEY) is `undefined` client-side and the Supabase
// client silently falls back to placeholder credentials.
export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || // legacy name
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY);

/** Server-side only. Never call this from a component that ships to the browser. */
export function getSupabaseSecretKey(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY || // legacy name
    ''
  );
}
