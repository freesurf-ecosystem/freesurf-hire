# FreeSurf Calorie Tracker — API & Model Reference

[To weave in: Image generation models:
Self-hosted SDXL on RunPod
krea/krea-2-medium-turbo, [.015/image] [could do one pop up add per image at this rate]
sourceful/riverflow-v2.5-fast [.019/image]]

free calorie tracker [photo analyzer: Self-hosted — Llama 3.2 Vision 11B on RunPod; meta-llama/llama-4-maverick is FREE on OpenRouter; google/gemini-2.0-flash-001 on OpenRouter: Image input: ~$0.00002 per photo]

Photo-based food calorie estimation. Photo → nutrition breakdown.

## How It Works (Vision LLM)

Send food photo + prompt to a vision model:
```
"Analyze this meal. Estimate: calories, protein (g), carbs (g), fat (g).
Identify each food item. Return JSON."
```

## API Options (MVP — pay per use)

| Provider | Model | Cost/Photo | Notes |
|---|---|---|---|
| **OpenRouter** | `google/gemini-2.0-flash-001` | ~$0.00003 | Cheapest vision model, fast |
| **OpenRouter** | `meta-llama/llama-4-maverick` | **FREE** | Rate-limited but viable for MVP |
| **OpenRouter** | `anthropic/claude-3.5-haiku` | ~$0.0004 | Most accurate nutrition estimates |
| **Google AI** | `gemini-2.0-flash` | ~$0.00002 | Direct API, slightly cheaper |

## Self-Hosted Options (zero per-request cost)

| Model | VRAM | Accuracy | Notes |
|---|---|---|---|
| **Llama 3.2 Vision 11B** | 16GB+ | Good | Best open vision model. RunPod serverless viable |
| **Qwen2-VL 7B** | 14GB+ | Decent | Lighter, faster cold starts |
| **Pixtral 12B** | 18GB+ | Very good | Strong on detail recognition |

## Recommended Path

1. **MVP**: Gemini Flash via OpenRouter ($0.00003/photo) — practically free
2. **Scale**: Llama 3.2 Vision on RunPod — $0.0002/photo but no API dependency
3. **Production**: Fine-tuned Llama Vision on nutrition datasets

## Economics

At $0.00003/photo with $3 CPM ads:
- 1 ad impression covers ~100,000 photos
- User tracks 3 meals/day = 33,000 daily users per ad impression
- Essentially free to operate

## App Features (MVP)

- Camera capture or photo library import
- AI analyzes food and returns nutrition breakdown
- Daily log of meals with totals
- Basic history (local storage)
- Barcode scanner (future)
- No login required
