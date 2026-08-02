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

## Hosting Cost Comparison: Cloudflare Workers vs DigitalOcean

These two serve the same role — they are the **server/host** that runs your backend code (API endpoints, webhooks, server-side logic). The terms can be used interchangeably in the context of "where does my code run."

### Terminology

| Term | What it means |
|---|---|
| **Server** | A computer (physical or virtual) that runs your backend code |
| **Host / Hosting** | The service that provides the server |
| **Cloudflare Workers** | Serverless hosting — you upload code, Cloudflare runs it on demand per-request |
| **DigitalOcean** | Traditional hosting — you rent a VPS or container that runs 24/7 |
| **Supabase** | Not a server/host — it's a managed database + auth service. It replaces the database layer, not the server. |

> Cloudflare and DigitalOcean are interchangeable as *hosting providers*. Supabase is not — it's a different layer (database, not compute).

### Scenario: 20K daily active users

Assuming ~10 API calls per user per session = **6M requests/month**.

| Line Item | Cloudflare Workers | DigitalOcean App Platform |
|---|---|---|
| **Base cost** | $0 (free tier: 100K req/day, then $0.30/million requests) | $5/mo (Basic — 512MB RAM, 1 container) |
| **Request cost** (6M/mo) | $1.80 | Included in container cost |
| **CPU / compute** | ~$0.60 (lightweight proxies, ~5ms avg) | Container provisioning covers this |
| **Database** | N/A (use Supabase, priced separately) | $15/mo (managed Postgres) or self-managed |
| **Bandwidth** | Free (Workers don't charge egress to Cloudflare services) | $5–10/mo |
| **Realistic tier** (can handle 20K DAU) | **$3/mo** | **$24–50/mo** (Pro tier, 2 containers with auto-scale) |
| **At 100K DAU** | **$15–25/mo** | **$80–150/mo** |
| **At 500K DAU** | **$75–125/mo** | **$300–600/mo** |

### Per-App Breakdown at 20K DAU

| App | Monthly Worker Requests | Monthly Worker Cost |
|---|---|---|
| **Natural Reader** (3 TTS calls/user/day) | 60K req/day | ~$0.60 |
| **Transcriber** (1 transcription/user/day) | 20K req/day | ~$0.20 |
| **Links** (5 profile views/user/day) | 100K req/day | ~$1.00 |
| **Invoices** (0 worker calls — uses Supabase directly) | 0 | $0 |
| **Post** (2 posts/user/day + dashboard) | 40K req/day | ~$0.40 |
| **Auth** (static page, Supabase direct) | 0 | $0 |

### Why Cloudflare Wins at This Scale

1. **Pay-per-use** — $0 at zero users, scales linearly. DigitalOcean charges for idle time.
2. **Zero egress** — R2, Workers, Pages all share a free network backbone. DigitalOcean charges per GB of outbound data.
3. **No server management** — no OS updates, no process monitoring, no restart scripts.
4. **Global edge** — Workers run in 300+ data centers, closest to each user. DigitalOcean has ~15 regions.
5. **Free tier generosity** — 100K Worker requests/day is enough for most of these apps individually until significant scale.

### The One Scenario Where DigitalOcean Wins

If you have a **single long-running process** (e.g., a WebSocket server managing thousands of concurrent live connections), a VPS is better. Workers have a 30-second CPU time limit per request. This is why the emmaline voice mode needs LiveKit rather than being ported to a raw Worker — and even then, LiveKit's server can run on a single $12/mo VPS or be self-hosted on RunPod.

### Rule of Thumb

Cloudflare Workers run your API logic. Supabase stores your data. Don't use Supabase Edge Functions — use Workers instead. The cost difference is decisive:

| | Supabase Edge Functions | Cloudflare Workers |
|---|---|---|
| Free tier | 500K invocations/mo | 100K requests/day (~3M/mo) |
| After free | $10 per million invocations | $0.30 per million requests |
| Cold starts | Yes (containers) | No (V8 isolates) |
| What it runs | JS/TS + embedded DB calls | JS/TS + fetch to anywhere |

**Cloudflare is 30x cheaper for the API layer.** The pattern — Worker validates the JWT, then reads/writes Supabase — means Supabase only bills for database queries (free up to 2GB). Combined free tiers cover ~50k MAU before any costs.

### When Self-Hosting Supabase Makes Sense

Running `docker compose up` with Supabase's self-hosted image on a rented pod gives you auth + Postgres + APIs in one box. But you pay for the pod 24/7 (~$316/month) instead of per-request. The crossover: when Supabase's paid tier ($25-75/mo) exceeds a pod's monthly cost. For most apps in the FreeSurf ecosystem, that's far in the future.

### Bottom Line

At any realistic scale for these micro-utility apps, **Cloudflare Workers are 5–15x cheaper than DigitalOcean** for the same workload. The crossover point where a VPS becomes cheaper is several million requests per *hour* — at which point ad revenue would dwarf hosting costs regardless.

---

## Related Docs

- [AD_RATES.md](./AD_RATES.md) — ad monetization rates and influencer economics
- [API_REFERENCE.md](./freesurf-transcriber/API_REFERENCE.md) — AI model costs per tool
- [EMMALINE_MIGRATION.md](./EMMALINE_MIGRATION.md) — steps to migrate emmaline off DigitalOcean
