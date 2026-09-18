import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY, hasSupabaseConfig } from './supabaseEnv';

// Next.js embeds NEXT_PUBLIC_* env vars at build time, so these are available in
// both server and client bundles. The publishable key is safe to expose.
//
// The most common misconfiguration is naming the key without the NEXT_PUBLIC_
// prefix, which works server-side and silently breaks in the browser — so warn
// on both sides. (console.* is stripped from production builds.)
if (!hasSupabaseConfig) {
  console.error(
    `[FreeSurf] Supabase config missing (${
      typeof window === 'undefined' ? 'server' : 'browser'
    }). Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLIC_KEY — the ` +
      'NEXT_PUBLIC_ prefix is required for the browser, and values are baked in ' +
      'at build time (restart the dev server after changing .env.local).'
  );
}

// Placeholders so importing this module never throws during build/prerender.
const isClient = typeof window !== 'undefined';

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_PUBLIC_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: isClient,
      autoRefreshToken: isClient,
      detectSessionInUrl: isClient,
      storage: isClient ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
    },
  }
);
