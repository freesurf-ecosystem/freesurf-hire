# RunPod GPU Cost Architecture

Self-hosted AI via RunPod — cost projections for ad-supported free apps.

## Two Approaches

| | Serverless (per-request) | Rented Pod (24/7) |
|---|---|---|
| Pricing | $0.40/hr GPU time (T4) | $0.44/hr flat = ~$316/mo |
| Billing | Per inference second | Per hour of existence |
| Best for | MVP, low/unknown volume | Steady volume, multi-app |
| Concurrency | Auto-scales | Fixed (1 GPU = 1 worker) |

## Per-Request Costs (Serverless)

| App | Model | GPU time per use | Cost per use |
|---|---|---|---|
| Reader (TTS) | Kokoro | ~3s per paragraph | ~$0.0003 |
| Transcriber | Whisper base + pyannote | ~30s per 5min audio | ~$0.003 |

At $0.02 ad revenue per use: 87% margin after GPU cost.

## Pod Utilization (Rented RTX 3090, 24GB)

| What runs | VRAM |
|---|---|
| Kokoro TTS | ~2GB |
| faster-whisper base + pyannote | ~4GB |
| **Combined** | **~6GB / 24GB** |

Room for 3-4 more models before needing a second pod.

## Scaling Math

| Monthly active users | Avg uses/user/mo | GPU time/mo | Serverless cost | Pod cost | Break-even |
|---|---|---|---|---|---|
| 1,000 | 5 | 4 hrs | ~$1.60 | $316 | Pod loses |
| 5,000 | 10 | 40 hrs | ~$16 | $316 | Pod loses |
| 50,000 | 10 | 400 hrs | ~$160 | $316 | Pod loses |
| 200,000 | 15 | 2,500 hrs | ~$1,000 | $316 | **Pod wins** |

At $0.02 ad revenue per use: 200k users × 15 uses × $0.02 = $60,000/mo revenue vs $316/mo infrastructure. The GPU cost becomes noise.

## Migration Path

```
MVP:      Serverless (per-request, auto-scales, no upfront)
          → Set RUNPOD_API_KEY + ENDPOINT_ID per app
          → Pay for what you use, $0 risk

Growth:   Rented 3090 pod ($316/mo flat)
          → Run Kokoro + Whisper + pyannote on same box
          → Point all Cloudflare Workers at pod IP:port
          → One pod = all apps

Scale:    2× 3090 pods or 1× A100 (load-balance via Workers)
          → $632-870/mo, handles thousands of concurrent users
```

## Revenue to Profit

Per-user economics at scale (rented pod):

| Metric | Value |
|---|---|
| Revenue per use (ads) | $0.02 |
| GPU cost per use | ~$0.00003 (amortized over pod) |
| Monthly users needed to cover pod | ~16,000 uses = ~1,000–2,000 MAU |
| Profit margin at 50k MAU | ~99% on GPU costs |

GPU infrastructure is a fixed cost. The app layer (bandwidth, workers) is near-free on Cloudflare's free tier. The business model works if usage is high enough to fill the pod's idle time.
