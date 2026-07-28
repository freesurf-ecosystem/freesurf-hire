/**
 * FreeSurf — Shared Brand & Domain Configuration (TypeScript)
 * ===========================================================
 * This is the SINGLE SOURCE OF TRUTH for all domain and brand values.
 *
 * To migrate domains (e.g., freesurf.tools → freesurf.to → free.surf):
 *   1. Change ROOT_DOMAIN below
 *   2. Update Cloudflare DNS / Worker routes
 *   3. Update Supabase redirect URLs in dashboard
 *   4. Update Google Search Console
 *   5. Redeploy all projects
 *
 * Nothing else in any codebase should hardcode domain or brand strings.
 */

const ROOT_DOMAIN = "freesurf.tools" as const;

export const FREESURF = {
  // ── Domain ──
  ROOT_DOMAIN,

  /** The cookie domain for cross-subdomain auth (.freesurf.tools) */
  COOKIE_DOMAIN: `.${ROOT_DOMAIN}` as const,

  // ── Brand ──
  BRAND_NAME: "FreeSurf" as const,
  BRAND_TAGLINE: "Free tools for freelancers & small businesses" as const,

  // ── Subdomains ──
  URLS: {
    home: `https://${ROOT_DOMAIN}`,
    auth: `https://auth.${ROOT_DOMAIN}`,
    invoices: `https://invoices.${ROOT_DOMAIN}`,
    links: `https://links.${ROOT_DOMAIN}`,
    post: `https://post.${ROOT_DOMAIN}`,
    hire: `https://hire.${ROOT_DOMAIN}`,
    pdf: `https://pdf.${ROOT_DOMAIN}`,
    scanner: `https://scanner.${ROOT_DOMAIN}`,
    contact: `mailto:hello@${ROOT_DOMAIN}`,
  } as const,

  // ── Auth ──
  AUTH: {
    COOKIE_NAME: "freesurf_session",
    COOKIE_MAX_AGE: 60 * 60 * 24 * 30, // 30 days
    SUPABASE_URL: "https://jstojewashwoswsskwjk.supabase.co",
    SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzdG9qZXdhc2h3b3N3c3Nrd2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTg2OTAsImV4cCI6MjA5MzkzNDY5MH0.o3hYxYr1ZbmEShPfZebx1vchjmIrN7uYZMX1C5fhoac",
  } as const,

  // ── CORS origins (for Workers) ──
  CORS_ORIGINS: {
    links: [
      `https://links.${ROOT_DOMAIN}`,
      "https://links-freesurf-dashboard.pages.dev",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    post: [
      `https://post.${ROOT_DOMAIN}`,
      `https://${ROOT_DOMAIN}`,
      "http://localhost:5173",
      "http://localhost:3000",
    ],
  } as const,

  // ── Tools ──
  TOOLS: [
    { name: "Invoices", url_subdomain: "invoices", status: "live", description: "Free invoice generator — no account required" },
    { name: "Links", url_subdomain: "links", status: "live", description: "Free link-in-bio pages" },
    { name: "Post", url_subdomain: "post", status: "beta", description: "Cross-post to social platforms" },
    { name: "Hire", url_subdomain: "hire", status: "coming-soon", description: "Contractor hiring hub" },
    { name: "PDF", url_subdomain: "pdf", status: "planned", description: "PDF reader, viewer, editor & e-sign" },
    { name: "Scanner", url_subdomain: "scanner", status: "planned", description: "PDF, QR & OCR scanner" },
  ] as const,
} as const;
