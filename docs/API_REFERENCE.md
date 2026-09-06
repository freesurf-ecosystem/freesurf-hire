# FreeSurf Calorie Tracker — API & Model Reference


## API infra providers

hosted alternatives
together ai
featherless.ai?
check into deepinfra, 
openrouter

## Self-Hosted Image Generation Models

| Model | VRAM | Self-hostable | Notes |
|---|---|---|---|
| **SDXL** | ~7–8GB | Yes (open weights) | Barely fits 24GB alongside the current pod load; OOM risk at peak |
| **Flux.1** | ~24GB | Yes (open weights) | Needs its own GPU — won't cohabit with the LLM group |


## Self-Hosted Transcription

| Model | Notes |
|---|---|
| **faster-whisper (base)** ⭐ current | Already on the pod; multilingual (~99 langs) |
| **Qwen3-ASR Flash** (`qwen/qwen3-asr-flash-2026-02-10`) | Open weights; fast multilingual ASR |
| **Voxtral Mini Transcribe** (`mistralai/voxtral-mini-transcribe`) | Open weights; multilingual transcription |


## Self-Hosted Vision Options

| Model | VRAM | Accuracy | Notes |
|---|---|---|---|
| **Llama 3.2 Vision 11B** | 16GB+ | Good | Best open vision model. RunPod serverless viable |
| **Qwen2-VL 7B** | 14GB+ | Decent | Lighter, faster cold starts |
| **Pixtral 12B** | 18GB+ | Very good | Strong on detail recognition |



## LLM Brain Options (Self-Hosted, fits T4/L4)

### Ranked by Multilingual Quality

| Rank | Model | VRAM | Languages | Notes |
|------|-------|------|-----------|-------|
| 1 | **Llama 3.1 8B** | ~16GB | 8 (fluent) | Best Spanish/European quality, large community |
| 2 | **Gemma 2 9B** | ~18GB | ~30 | Google's best, excellent multilingual breadth |
| 3 | **Mistral 7B (4-bit)** | ~5GB | ~10 | Strong French/Spanish, tiny VRAM footprint |
| 4 | **Qwen 3 4B** | ~8GB | 29+ | Newest Qwen gen, much better multilingual than 2.5 |
| 5 | **Qwen2.5 3B** ⭐ current | ~6GB | 29+ | Wide language coverage, Spanish has typos |
| 6 | **Llama 3.2 3B** | ~6GB | 8 | English + major European only |
| 7 | **Phi-4-mini 3.8B** | ~8GB | ~20 | Strong reasoning, good instruction following |


## TTS options

### Ranked by Voice Quality (Future Reference)

| Rank | Model | VRAM | Languages | Notes |
|------|-------|------|-----------|-------|
| 1 | **Chatterbox Multilingual V3** | ~1-2GB | 23 | MIT, cross-lingual voice cloning, watermarked |
| 2 | **Fish Speech S2** | ~12GB | 80+ | Open weights, SOTA cloning + emotion tags |
| 3 | **MOSS-TTS 1.5** | ~24GB | 31 | Apache 2.0, high-fidelity cross-lingual cloning + pause control |
| 4 | **Kokoro** ⭐ current | ~1GB | ~9 | Apache 2.0, fast/light, no cloning |
| 5 | **F5-TTS** | ~1-2GB | English-first | MIT, zero-shot cloning |


