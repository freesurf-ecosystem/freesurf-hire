# Ad Monetization Reference

[identify an influencer rate]

Real-world CPM rates for mobile apps. All figures are estimates — actual rates vary by region, season, and ad network.

---

## Ad Types & Rates

| Ad Type | CPM Range | Per Impression | Per Click | Est. Total/Impression* | User Friction |
|---|---|---|---|---|---|
| **Banner** (320×50) | $0.10–0.50 | $0.0001–0.0005 | $0.01–0.05 | **$0.0002–0.0007** | Very low — always visible |
| **Native** (blends in) | $1.00–3.00 | $0.001–0.003 | $0.05–0.15 | **$0.0015–0.0045** | Low — looks like content |
| **Interstitial** (full screen) | $2.00–5.00 | $0.002–0.005 | $0.10–0.30 | **$0.004–0.010** | Medium — between actions |
| **Rewarded Video** (15–30s) | $10.00–20.00 | $0.01–0.02 | $0.20–0.50 | **$0.015–0.030** | High — user must watch 15-30s before dismiss |

> *Estimated total combines impression + click revenue based on typical CTR (Banner 0.75%, Native 1.5%, Interstitial 3.5%, Rewarded 7.5%). Clicks effectively double interstitial/rewarded earnings.

---

## Rewarded Video Details

- User sees an offer: "Watch a short ad to unlock [benefit]"
- Ad plays for **15–30 seconds** (cannot skip)
- After ad completes, user gets the reward
- Highest CPM but requires user opt-in
- Examples: "Watch to remove ads for 1 hour" / "Watch to unlock premium voice"

---

## Per-Session Economics

One table: realistic session size → AI cost → ad revenue → does it pencil?

| App | Session | AI Cost/Session | Ad Revenue* | Margin | Pencils? |
|---|---|---|---|---|---|
| **Calorie Tracker** | 3 meal photos | $0.00009 (Gemini Flash) | $0.027 (1 inter + 1 rewarded) | **99.7%** | ✅ Massively |
| **Image Maker** | 4 generated images | $0.012 (Flux API) | $0.027 (1 inter + 1 rewarded) | **56%** | ✅ Tight, self-hosting flips to 96% |
| **Transcriber** | 30 min audio | $0.12 (Groq API) | $0.054 (2 inter + 1 rewarded) | **−55%** | ❌ API pricing. Self-hosting = $0.003 = 94% margin |
| **Natural Reader** | 10K chars (~8 min audio) | $0.004 (Kokoro RunPod) | $0.014 (1 banner + inter) | **71%** | ✅ Already profitable |

> *Revenue assumes mix of interstitial ($0.007 avg) + rewarded ($0.02 avg) + banner ($0.0005/impression).
> Self-hosted costs: SDXL ~$0.0005/img, Whisper ~$0.0001/min. Both flip margins to 90%+.

**The rule**: API pricing works for cheap models (Gemini Flash, Kokoro). Expensive ones (Whisper via Groq, Flux via Replicate) need self-hosting to pencil. Transcriber is the only one that's underwater on API — it's your priority for self-hosting.

---

## Influencer Economics

### The Math

Your numbers are close. Here's the breakdown at $50/100K views:

| Metric | Conservative | Realistic | Optimistic |
|---|---|---|---|
| Views | 100,000 | 100,000 | 100,000 |
| Download rate | 1% | 2% | 4% |
| Installs | 1,000 | 2,000 | 4,000 |
| **Cost per install (CPI)** | **$0.05** | **$0.025** | **$0.0125** |

For context, Meta/Google ad CPI for utility apps averages $0.50–2.00. Influencer at $0.025–0.05 CPI is **10-40x cheaper**.

### Payout Per Platform

These are *content sponsorship* rates, not ad platform rates. You pay the creator directly.

| Platform | Rate/1K Views | $50 Buys | Notes |
|---|---|---|---|
| **TikTok** (nano 1K–10K) | $0.25–0.50 | 100K–200K views | Cheap, viral potential, young demo |
| **TikTok** (micro 10K–100K) | $0.50–1.00 | 50K–100K views | Better conversion, niche audiences |
| **YouTube Shorts** | $0.30–0.80 | 60K–165K views | Longer content lifespan |
| **Instagram Reel** | $0.50–1.50 | 33K–100K views | Higher trust, older demo |
| **TikTok** (macro 100K+) | $2.00–5.00 | 10K–25K views | Not worth it at this stage |

### Does It Pencil at $0.10 LTV?

| LTV per User | 1,000 Installs | 2,000 Installs | 4,000 Installs |
|---|---|---|---|
| $0.10 | $100 (−$50 loss) | $200 (+$150) | $400 (+$350) |
| $0.25 | $250 (+$200) | $500 (+$450) | $1,000 (+$950) |
| $0.50 | $500 (+$450) | $1,000 (+$950) | $2,000 (+$1,950) |

At 2% conversion and $0.10 LTV, you make $150 profit per $50 spent — **3x return**. The LTV rises as you add more apps (cross-install ecosystem effect), so this is actually pessimistic.

### The Ecosystem Multiplier

A user who downloads FreeSurf Invoices and sees "Also from FreeSurf: Natural Reader, Calorie Tracker..." in the app footer might install 2-3 tools total. Each additional install is more ad impressions with zero additional influencer cost.

| Apps Per User | Effective LTV | 2,000 Users |
|---|---|---|
| 1 app | $0.10 | $200 |
| 2 apps | $0.18 | $360 |
| 3 apps | $0.25 | $500 |

The cross-sell is your compounding advantage. Every influencer campaign feeds the whole ecosystem.

### Recommended Starting Budget

| Phase | Spend | Expected Installs | Expected Revenue | Risk |
|---|---|---|---|---|
| **Test** | $50–100 | 1,000–4,000 | $100–400 | Low — 1 TikTok post |
| **Validate** | $200–500 | 4,000–20,000 | $400–2,000 | Medium — 5-10 posts |
| **Scale** | $1,000+ | 20,000+ | $2,000+ | When Phase 2 confirms unit economics |

Start with nano-influencers (1K–10K followers) in your niche — freelancers, small business owners, contractors. Their rates are lowest and their audiences are most relevant. One solid video showing "I made an invoice in 30 seconds with this free app" from a freelance bookkeeper with 5K followers is worth more than a generic post from someone with 500K.

---

## Ad Networks (Ranked by Fill Rate)

| Network | Best For | Notes |
|---|---|---|
| **Google AdMob** | General | Largest network, best fill rate globally |
| **Meta Audience Network** | US/EU | Higher CPMs, lower fill outside Tier 1 |
| **Unity Ads** | Games | Rewarded video specialist |
| **AppLovin** | US | Good interstitial CPMs |
| **Pangle** | Asia/LATAM | Best fill in emerging markets |

Start with AdMob — it has the best global fill rate and you can add mediation later.

---

## Recommended Strategy Per App

| App | Primary Ad | Secondary | Hook |
|---|---|---|---|
| Calorie Tracker | Rewarded video (after analysis) | Banner | "Watch to unlock meal history" |
| Image Maker | Interstitial (after generate) | Rewarded | "Watch for HD resolution" |
| Transcriber | Interstitial (after transcribe) | Rewarded | "Watch to remove 5-min limit" |
| Natural Reader | Banner (persistent) | Interstitial (after read) | "Watch for premium voices" |
| Invoice Maker | Banner only | None | Don't interrupt workflow |
| Link-in-Bio | None | None | Free publicity |

---

## When to Go Ad-Free / Subscription

Once you have the subscription system (cross-app, removes ads across all FreeSurf tools):

- **$2.99/month** — remove ads on single app
- **$4.99/month** — remove ads across ALL FreeSurf apps
- **$29.99/year** — discounted annual

A single rewarded video earns ~$0.015. A $2.99 subscription = ~200 rewarded video views. If a user watches more than ~7 videos/day, they're more valuable on subscription.
