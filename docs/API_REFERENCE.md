# FreeSurf Calorie Tracker — API & Model Reference

[To weave in: Image generation models:
Self-hosted SDXL on RunPod
krea/krea-2-medium-turbo, [.015/image] [could do one pop up add per image at this rate]
sourceful/riverflow-v2.5-fast [.019/image]]

combine all three into one Docker image on a single L4 (24GB):
Whisper base: ~140MB VRAM
Qwen2.5 3B: ~6GB VRAM  
Kokoro 82M: ~200MB VRAM
Total: ~7GB VRAM — fits L4 with room to spare
One endpoint, one Docker image, one handler that orchestrates STT → LLM → TTS in sequence. ~$0.46/hr total.

## How It Works (Vision LLM)

Send food photo + prompt to a vision model:
```
"Analyze this meal. Estimate: calories, protein (g), carbs (g), fat (g).
Identify each food item. Return JSON."
```


## Self-Hosted Vision Options

| Model | VRAM | Accuracy | Notes |
|---|---|---|---|
| **Llama 3.2 Vision 11B** | 16GB+ | Good | Best open vision model. RunPod serverless viable |
| **Qwen2-VL 7B** | 14GB+ | Decent | Lighter, faster cold starts |
| **Pixtral 12B** | 18GB+ | Very good | Strong on detail recognition |

Self-hosted transcription
To add: qwen/qwen3-asr-flash-2026-02-10 or mistralai/voxtral-mini-transcribe for self-hosted transcription

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

---

# FreeSurf Voice Tutor — Architecture Reference

Real-time voice conversation tutor using self-hosted STT + LLM + TTS.

## Pipeline

```
User speaks → STT (faster-whisper) → LLM (conversation brain) → TTS (Kokoro)
```

## Interaction Model

**Tap-to-talk** (MVP): User taps a button, speaks, then taps again when done. The app transcribes → passes to LLM → speaks the response back. Simpler and more reliable than VAD-based pause detection.

**Pause detection** (future): Monitor silence for 2-3 seconds after speech ends, auto-trigger LLM processing. Needs VAD integration.

## LLM Brain Options (Self-Hosted, fits T4/L4)

| Model | VRAM | Languages | Quality | Notes |
|---|---|---|---|---|
| **Qwen2.5 3B** ⭐ | ~6GB | 29+ | Best overall | Confirmed: EN/ES/FR/DE/PT/IT/JA/RU/KR/AR/TH/VN + more |
| Llama 3.2 3B | ~6GB | 8 | Good | Primarily English + major European languages |
| Phi-4-mini 3.8B | ~8GB | ~20 | Very good reasoning | Microsoft, strong instruction following |
| Mistral 7B (4-bit) | ~5GB | ~10 | Great | Good multilingual, needs bitsandbytes |

**Recommended: Qwen2.5-3B-Instruct** — explicitly tested for 29 languages, fits T4 16GB, and handles all our starter pairs natively.

## Language Coverage

### Current (Kokoro TTS, 9 languages)
| Language | TTS Voices | STT | Language Pair Viability |
|---|---|---|---|
| English (US) | 19 voices | ✅ | Native |
| English (UK) | 8 voices | ✅ | Native |
| Spanish | 3 voices | ✅ | Good starter pair |
| French | 1 voice | ✅ | Good starter pair |
| German | 1 voice | ✅ | Good starter pair |
| Italian | 2 voices | ✅ | OK |
| Portuguese | 2 voices | ✅ | Good starter pair |
| Hindi | 3 voices | ✅ | Large market |
| Japanese | 2 voices | ✅ | OK |
| Polish | 1 voice | ✅ | OK |

### Recommended Starter Pairs
- **English ↔ Spanish** (US market, 3 Spanish voices)
- **English ↔ Portuguese** (Brazil market)
- **English ↔ German** (European market)
- **English ↔ French** (Canadian/European market)

### Gaps
- No Mandarin/Cantonese TTS — would need a second TTS provider (Bark, XTTS, ElevenLabs API)
- Single-voice languages (French, German) limit voice variety
- Kokoro does NOT auto-detect language — must set `lang_code` manually

## RunPod Cost Estimate

| Component | GPU | $/hr | Notes |
|---|---|---|---|
| STT (whisper) | L4 24GB | $0.46 | Already deployed |
| TTS (Kokoro) | L4 24GB | $0.46 | Already deployed |
| LLM (3B model) | L4 24GB | $0.46 | New endpoint needed |
| **Total** | **3× L4** | **$1.38/hr** | Separate endpoints |
| **Consolidated** | **1× A6000 48GB** | **$0.79/hr** | All on one GPU |

## Next Steps
1. Deploy a 3B conversational LLM on RunPod (Qwen2.5 3B recommended)
2. Build tap-to-talk UI in the mobile app
3. Wire STT → LLM → TTS pipeline
4. Add language pair selector
5. Test English/Spanish as first bilingual pair
