# RunPod GPU Breakdown

Quick reference for GPU selection. Prices are approximate per-hour for on-demand serverless.

## GPU Comparison

| GPU | VRAM | Memory Bandwidth | ~$/hr | Notes |
|---|---|---|---|---|
| RTX 4000 Ada | 20 GB | 360 GB/s | $0.39 | Dev/testing, small models |
| A40 | 44 GB | 696 GB/s | $0.40 | **Best value.** Qwen 3B ideal |
| A100 40GB | 40 GB | 1.5 TB/s | $0.70 | 2x faster than A40 |
| A100 80GB | 80 GB | 2.0 TB/s | $1.10 | Fast, plenty of headroom |
| H100 | 80 GB | 3.3 TB/s | $1.99 | Fastest available |

## Model Recommendations

| App | Model | VRAM Needed | Recommended GPU |
|---|---|---|---|
| Language Tutor | Qwen 2.5 3B Instruct | ~6 GB | A40 |
| Calorie Tracker | Qwen 2.5 3B / VL 7B | ~6-14 GB | A40 |
| Calorie Tracker (large) | Llama 3.2 11B Vision | ~20 GB | A40 / A100 |

## Key Concept

- **VRAM** = tank size (how much model fits)
- **Memory bandwidth** = pipe speed (how fast it runs)
- LLM inference is **bandwidth-bound** — higher bandwidth = faster tokens
- More VRAM usually means more bandwidth (wider memory bus)
- For small models (3-7B), the A40 hits the price/performance sweet spot

## Scaling Path

1. **A40 + warm worker** → launch, 1-2 concurrent users
2. **A100 40GB** → 2x speed, handles 3-4 concurrent requests
3. **Multiple A100 workers** → scale out for more users
