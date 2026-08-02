# Storage & Database Cost Strategy

FreeSurf cost architecture — keeping infrastructure near-zero while preserving premium subscription upside.

---

## Storage Cost Hierarchy

| Layer | Cost | Best For |
|---|---|---|
| **Device local** (AsyncStorage / FileSystem) | **$0** | Invoice drafts, recordings, history, generated images |
| **Cloudflare R2** | $0.015/GB/mo + **zero egress** | Link profiles, public pages, shared content |
| **Cloudflare KV** | $0.50/million reads | User→username mappings, analytics counters |
| **Cloudflare D1** (SQLite) | $0.75/million rows read | Could replace Supabase for simple relational data — worth watching |
| **Supabase** | Free tier → $25/mo Pro | Auth + premium user sync only |

---

## The Default Strategy Per App

```
┌──────────────────────────────────────────┐
│              FREE TIER ($0)               │
│  Device local storage — everything works  │
│  No account needed, no server cost        │
│  Ads monetize this tier                   │
└──────────────────┬───────────────────────┘
                   │
                   ▼  User wants cross-device sync
┌──────────────────────────────────────────┐
│           PREMIUM TIER ($4.99/mo)         │
│  Supabase stores synced data              │
│  Removes ads across all apps              │
│  Cloud backup of settings/preferences     │
└──────────────────────────────────────────┘
```

## Per-App Storage Plan

| App | Free Tier (Local) | Premium Tier (Supabase) |
|---|---|---|
| **Invoices** | AsyncStorage JSON blob | `invoice_drafts`, `invoice_business_profiles` tables |
| **Links** | — (already server-side via R2) | Account owns profile, premium themes |
| **Post** | — (needs OAuth tokens on server) | Platform tokens encrypted in Supabase |
| **Natural Reader** | expo-file-system WAV files | Sync recordings across devices |
| **Transcriber** | AsyncStorage transcripts | Sync transcript history |
| **Image Maker** | expo-file-system PNG files | Sync gallery across devices |
| **Calorie Tracker** | AsyncStorage meal log | Sync nutrition history |

---

## The Math

Free tier costs **$0/server/user**. Premium tier at $4.99/mo costs maybe $0.05–0.10 in Supabase + bandwidth. That's 98% margin on subscriptions. And the subscription removes ads, so you lose ~$0.15/mo in ad revenue per premium user — but gain $4.99, a 33x trade-up.

Local-first is both a cost strategy and a privacy selling point. "Your data stays on your device" is a genuine differentiator versus cloud-dependent competitors.

---

## Why Not Supabase for Everything?

| Concern | Reality |
|---|---|
| **Pricing at scale** | Supabase Pro at $25/mo covers 100K users comfortably. Their pricing scales linearly — not a trap. |
| **Vendor lock-in** | Supabase is open source. You can self-host if ever needed. |
| **Free tier limits** | 500MB database, 50K monthly active users, 2GB bandwidth. Plenty for your first 10K-50K users. |
| **Cold starts** | Not an issue — Supabase is always warm (unlike RunPod serverless). |

Supabase is fine as the *premium sync layer*. The risk isn't Supabase pricing — it's putting *everything* in Supabase and paying for rows that could live on-device for free.

---

## When to Revisit

| Trigger | Action |
|---|---|
| Free tier approaching 500MB | Evaluate D1 for non-auth relational data |
| 50K+ MAU on Supabase | Pro plan at $25/mo — still just 3 premium subscribers covers it |
| 500K+ MAU | Consider self-hosted Supabase or D1 migration for cost isolation |
| R2 storage exceeding 10GB | Still only $0.15/mo — not urgent |
| Premium users exceeding 1,000 | At $4.99 × 1,000 = $4,990/mo, infrastructure costs become noise |

---

---

## Server Cost Comparison

Backend logic for these apps is lightweight — validate a JWT, proxy to RunPod, read/write a database row. The question is where that logic runs.

### Serverless: Cloudflare Workers vs Supabase Edge Functions

Both are serverless — you upload code, they run it per-request. But the pricing model is very different:

| | Supabase Edge Functions | Cloudflare Workers |
|---|---|---|
| Free tier | 500K invocations/mo | 100K requests/day (~3M/mo) |
| After free | $10 per million invocations | $0.30 per million requests |
| Cold starts | Yes (containers) | No (V8 isolates) |
| What it runs | JS/TS + embedded DB calls | JS/TS + fetch to anywhere |

**Cloudflare is 30x cheaper for the API layer.** The Workers pattern — validate a JWT, fetch/write Supabase, return JSON — means Supabase only bills for database queries (free up to 2GB). Combined free tiers cover ~50k MAU before any costs.

### Traditional Hosting: Cloudflare Workers vs DigitalOcean

For comparison, here's what a traditional VPS or container platform costs versus Workers at 20K DAU (~6M requests/month):

| Line Item | Cloudflare Workers | DigitalOcean App Platform |
|---|---|---|
| **Base cost** | $0 (free tier: 100K req/day) | $5/mo (Basic — 512MB RAM) |
| **Request cost** (6M/mo) | $1.80 | Included |
| **Database** | N/A (use Supabase, separate) | $15/mo (managed Postgres) |
| **Bandwidth** | Free | $5–10/mo |
| **Realistic at 20K DAU** | **$3/mo** | **$24–50/mo** |
| **At 100K DAU** | **$15–25/mo** | **$80–150/mo** |
| **At 500K DAU** | **$75–125/mo** | **$300–600/mo** |

### Per-App Worker Breakdown at 20K DAU

| App | Requests/day | Monthly Cost |
|---|---|---|
| Natural Reader (3 TTS calls/user) | 60K | ~$0.60 |
| Transcriber (1 transcription/user) | 20K | ~$0.20 |
| Links (5 profile views/user) | 100K | ~$1.00 |
| Invoices (uses Supabase directly, no worker) | 0 | $0 |
| Post (2 posts + dashboard) | 40K | ~$0.40 |

### When Self-Hosting Makes Sense

Running `docker compose up` with Supabase's self-hosted image on a rented pod gives auth + Postgres + APIs in one box — but costs ~$316/month 24/7. The crossover point is when Supabase's paid tier exceeds a pod's cost, which is far in the future for these apps.

Same logic applies to a rented GPU pod: serverless RunPod is the right call for MVP. If transcription or TTS volume hits thousands of hours/month, a dedicated 3090 at $316/month beats per-request pricing.

### Bottom Line

Cloudflare Workers are the right server layer now — free tier covers everything, the architecture is simple, and there's no server to manage. Revisit if costs ever exceed $100/month, which is hundreds of thousands of active users away.

---

## Related Docs

- [AD_RATES.md](./AD_RATES.md) — ad monetization rates and influencer economics
- [API_REFERENCE.md](./freesurf-transcriber/API_REFERENCE.md) — AI model costs per tool
- [EMMALINE_MIGRATION.md](./EMMALINE_MIGRATION.md) — steps to migrate emmaline off DigitalOcean
