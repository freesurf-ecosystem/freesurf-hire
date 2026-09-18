# FreeSurf Hire — Contractor Network

The web app for the FreeSurf contractor network: a free, open-source directory
that connects clients with contractors, tradespeople, and freelancers.

Clients search by service and location, then either send a request straight to
the contractor or reveal a phone number and call. There are **no lead fees, no
commission on work, and no subscriptions**.

- Clients submit requests through a form; the contractor sees them in a dashboard
- Contractors list services, service area, and a public profile
- Phone numbers are never listed publicly — they're revealed one at a time, on
  request, and only if the contractor allows it
- Local services use a zipcode; remote skills don't need one

## Tech stack

- **Framework**: Next.js 15 (Pages Router)
- **UI**: React 18 + TypeScript + Tailwind CSS + lucide-react
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare)
- **Node**: v22.x

## Project structure

```
├── pages/                    # Next.js pages (Pages Router)
│   ├── api/                  # API routes (consent, subscribe, phone reveal)
│   ├── resources/            # Article pages
│   └── [...slug].tsx         # Service / location / zip landing routes
├── src/
│   ├── components/           # React components (incl. ContractorDashboard)
│   ├── config/               # consent, pricing, subscriptions
│   ├── data/                 # services, service types, zip → city lookup
│   ├── lib/                  # supabase client + env resolution
│   └── utils/                # schema (JSON-LD) generation
├── supabase/
│   ├── migrations/           # SQL migrations — apply in filename order
│   └── functions/            # Edge functions (Google Places, email)
├── public/                   # Static assets, sitemaps, /graphics
└── scripts/                  # Sitemap + research tooling
```

## Getting started

Requires Node.js v22.x and a Supabase project.

```bash
npm install
npm run dev        # http://localhost:3000
```

### Environment

Create `.env.local` (git-ignored — see [.env.example](.env.example)):

```bash
# Public. Baked into the browser bundle at build time.
# NEXT_PUBLIC_ is required — Next only inlines that prefix.
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=sb_publishable_...

# Server-side only. Used by pages/api/* for operations that need to bypass RLS
# (recording consent, revealing a phone number). Never expose to the browser.
SUPABASE_SECRET_KEY=sb_secret_...

# Optional — admin panel only.
ADMIN_PASSWORD=
```

Supabase's newer key naming is used deliberately: the **publishable** key is safe
to ship to browsers, the **secret** key replaces the legacy service-role key and
must never reach client code. Legacy `..._ANON_KEY` / `..._SERVICE_ROLE_KEY`
names are still accepted as fallbacks in `src/lib/supabaseEnv.ts`.

Sign-in and profile creation only need the two `NEXT_PUBLIC_*` values. The secret
is required for the Terms gate, phone reveal, and email-preference routes —
without it those fail closed with a 500.

### Database

Apply `supabase/migrations/*.sql` in filename order (SQL editor or
`supabase db push`). Migrations are idempotent.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` / `npm start` | Production build / serve on :8080 |
| `npm run lint` | ESLint |
| `npm run clean` | Clear `.next` and caches (use when dev misbehaves) |
| `npm run deploy` | Build + deploy to Cloudflare Workers |

## Deployment

Pushes to `main` that touch `web/**` deploy automatically via
`.github/workflows/deploy-web.yml` (OpenNext → Cloudflare Workers).

- `NEXT_PUBLIC_*` values are **inlined at build time**, so they're supplied as
  GitHub repository variables during CI — not as Cloudflare vars.
- `SUPABASE_SECRET_KEY` is a **Cloudflare Worker secret**
  (`npx wrangler secret put SUPABASE_SECRET_KEY`) and is never referenced at
  build time.

## Notes for contributors

- `src/data/services.ts` and the sitemaps under `public/sitemaps/` are
  **generated**. The taxonomy they're built from is maintained outside this
  repository (it's derived from competitor research and encodes SEO strategy),
  so regenerating them requires that source. Treat the generated files as
  build artifacts.
- Phone numbers and emails are deliberately **not** on the public profile table.
  They live in `hire_contractor_private`, which anonymous clients cannot read.
  Don't move them back — see the comment in the contractor migration.
- `next.config.mjs` sets `ignoreBuildErrors` / `ignoreDuringBuilds` while the
  legacy template is being cleaned up. Lint and types still run in CI.

## License

MIT — see [LICENSE](../LICENSE).
