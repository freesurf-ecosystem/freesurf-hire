
# Reader (Kokoro TTS) — freesurf-reader

1. Build the Docker image:
cd serverless
docker build -t freesurf-reader-kokoro .
docker tag freesurf-reader-kokoro <registry>/freesurf-reader-kokoro:latest
docker push <registry>/freesurf-reader-kokoro:latest
2. Create RunPod endpoint: GPU 24GB (L4/A5000), 0 min / 3 max workers, idle 60s, FlashBoot enabled. No env vars needed.
3. Deploy worker:
cd worker
npm install
npx wrangler secret put RUNPOD_API_KEY
npx wrangler secret put RUNPOD_ENDPOINT_ID
npx wrangler deploy

# Transcriber (Whisper + pyannote) — freesurf-transcriber

1. Get a HuggingFace token: https://huggingface.co/settings/tokens
2. Accept pyannote license: https://huggingface.co/pyannote/speaker-diarization-3.1
3. Build the Docker image:
cd serverless
docker build -t freesurf-transcriber .
docker tag freesurf-transcriber <registry>/freesurf-transcriber:latest
docker push <registry>/freesurf-transcriber:latest
4. Create RunPod endpoint: GPU 16GB (T4 minimum, L4 better), 0 min / 2 max workers, idle 60s. Set env var HF_TOKEN = your HuggingFace token.
5. Deploy worker:
cd worker
npm install
npx wrangler secret put RUNPOD_API_KEY
npx wrangler secret put RUNPOD_ENDPOINT_ID
npx wrangler deploy

Same RUNPOD_API_KEY for all, but each gets its own RUNPOD_ENDPOINT_ID.

# Calorie Tracker (Llama 3.2 Vision) — freesurf-calorie-tracker

1. Build the Docker image:
```
cd serverless
docker build -t freesurf-calorietracker .
docker tag freesurf-calorietracker <registry>/freesurf-calorietracker:latest
docker push <registry>/freesurf-calorietracker:latest
```
2. Create RunPod endpoint: **GPU 24GB** (L4/A5000), 0 min / 2 max workers, idle 60s. No env vars needed. Model downloads at first cold start (~5 min to fetch 11B params).
3. Deploy worker:
```
cd worker
npm install
npx wrangler secret put RUNPOD_API_KEY
npx wrangler secret put RUNPOD_ENDPOINT_ID
npx wrangler deploy
```

Note: First cold start downloads ~7GB of model weights. Subsequent warm requests skip this. Use L4 (24GB) — T4 (16GB) is too small for Llama 3.2 Vision 11B. To switch to Qwen2-VL 7B for T4 compatibility, change MODEL_ID in handler.py.