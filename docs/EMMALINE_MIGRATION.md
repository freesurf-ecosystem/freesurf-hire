# Emmaline Migration — Disconnecting from DigitalOcean

Goal: eliminate the Express backend dependency so the app runs entirely on Cloudflare Workers + Supabase, with zero traditional server hosting.

## Current State

Emmaline has a Node.js Express backend deployed on DigitalOcean App Platform (`app.yaml`, repo `ah8571/oov`). It serves 17 API routes + 2 WebSocket paths. The app also uses Supabase for database and auth — the Express server is just a middleman between the mobile app and external services.

## Target State

```
Mobile App (Expo/RN)  ──→  Supabase (auth, DB, storage)
                       ──→  Cloudflare Workers (TTS, STT, Stripe, email)
                       ──→  LiveKit (real-time voice)
```

No Express server. No DigitalOcean. No VPS.

---

## Step-by-Step Migration

### Step 1 — Cut Auth Routes (remove `/api/auth/*`)

**Time: ~1 hour**

The mobile app already uses `mobile/src/services/supabaseAuth.js` which talks to Supabase directly. The Express `/api/auth/*` routes are redundant — they just forward requests to Supabase.

- Delete `backend/src/routes/auth.js`
- Remove auth import/mount from `backend/src/index.js`
- Mobile app: verify `supabaseAuth.js` handles sign-in, sign-up, token refresh, and Apple OAuth independently
- If the mobile app calls `/api/auth/*` anywhere, replace with direct Supabase SDK calls

### Step 2 — Replace Reader Routes (remove `/api/reader/*`)

**Time: ~0 hours (already migrated)**

The freesurf `natural-reader` app already has a Cloudflare Worker at `reader.freesurf.tools` that handles:
- `POST /api/tts` — text-to-speech via RunPod Kokoro (20 voices, 9 languages)
- `POST /api/extract` — PDF text extraction
- Saved audio CRUD is handled client-side via local filesystem (AsyncStorage/file system)

- Point the emmaline mobile app's reader screen at the existing worker
- Delete `backend/src/routes/reader.js`
- Delete `backend/src/services/textToSpeechService.js` (multi-provider TTS — no longer needed)
- Delete `backend/src/services/documentReaderService.js`

### Step 3 — Replace Transcription Routes (remove `/api/listen/*`)

**Time: ~0 hours (already migrated)**

The freesurf `freesurf-transcriber` app already has a Cloudflare Worker at `transcribe.freesurf.tools` that handles:
- `POST /api/transcribe` — audio to text via OpenRouter Parakeet (NVIDIA)

- Point the emmaline mobile app's listen mode at the existing worker
- Delete `backend/src/routes/listen.js`
- Delete `backend/src/services/speechToTextService.js` (Google Cloud STT — no longer needed)
- Keep `openRouterVoiceService.js` as reference (Parakeet config is already in the Worker)

### Step 4 — Replace CRUD Routes (remove `/api/calls/*`, `/api/notes/*`, etc.)

**Time: 1-2 hours**

These routes are thin wrappers around Supabase database calls. The mobile app can call Supabase directly.

- Add `@supabase/supabase-js` as a mobile dependency (if not already)
- Create a `mobile/src/services/database.js` or equivalent with functions like `getCalls()`, `saveNote()`, etc. that call Supabase tables directly
- Supabase Row-Level Security (RLS) ensures users only access their own data — no server-side validation needed
- Delete `backend/src/routes/calls.js`, `backend/src/routes/notes.js`
- Delete relevant functions from `backend/src/services/databaseService.js`

### Step 5 — Replace Stripe/Billing (replace `/api/billing/*`, `/api/stripe/*`)

**Time: a few hours**

This is the one route that can't be cut entirely — Stripe webhooks must be received server-side. But a Cloudflare Worker can handle this.

Create a single Worker at `api.freesurf.tools` (or a dedicated `billing.freesurf.tools`):

```
POST /api/stripe/webhook
  → Verify Stripe signature (raw body verification, no SDK needed)
  → Update user_subscriptions table in Supabase
```

Stripe provides webhook signature verification code that works without the stripe-node SDK. The Worker just needs:
- `STRIPE_WEBHOOK_SECRET` (env secret)
- `SUPABASE_SERVICE_ROLE_KEY` (env secret)
- Raw request body (set `rawBody: true` in Worker config)

The mobile app uses Stripe's React Native SDK for checkout sessions — that already talks to Stripe directly. Only the webhook needs a backend.

### Step 6 — Replace Voice Mode (remove `/api/voice/*`, `/ws/*`)

**Time: a few days**

Replace the Express WebSocket voice handling with LiveKit:

1. Create a basic Cloudflare Worker that issues LiveKit tokens:
   ```
   GET /api/voice/token
     → Verify Supabase JWT
     → Call LiveKit API to create ephemeral token
     → Return token to mobile app
   ```

2. In the mobile app, replace the WebSocket voice logic with LiveKit's React Native SDK. LiveKit handles all the realtime audio streaming, room management, and transport.

3. The LiveKit server can be self-hosted (on RunPod or any GPU instance) or use LiveKit Cloud (free tier available).

4. Delete `backend/src/routes/voice.js`, `backend/src/services/openaiRealtimeService.js`

### Step 7 — Replace Email/Support (remove `/api/support/*`, newsletter)

**Time: ~1 hour**

Create a single Worker endpoint that calls Resend API directly:

```
POST /api/support
  → Accept contact form data
  → Call Resend API to send email
  → Return success
```

Delete `backend/src/routes/support.js`

### Step 8 — Cleanup

Once all routes are ported:

- Delete the entire `backend/` directory
- Delete `app.yaml` (DigitalOcean App Platform config)
- Update mobile app `api.js` to point at the new Worker URLs
- Update environment variable references
- Remove DigitalOcean from any documentation

**The Express server no longer exists. Nothing is hosted on DigitalOcean.**

---

## What Each Service Replaces

| Express Route | Replaced By |
|---|---|
| `/api/auth/*` | Supabase SDK (mobile direct) |
| `/api/reader/*` | Cloudflare Worker + RunPod Kokoro |
| `/api/listen/*` | Cloudflare Worker + OpenRouter Parakeet |
| `/api/calls/*` | Supabase SDK (mobile direct) |
| `/api/notes/*` | Supabase SDK (mobile direct) |
| `/api/transcripts/*` | Supabase SDK (mobile direct) |
| `/api/voice/*` | LiveKit |
| `/api/billing/*`, `/api/stripe/*` | Cloudflare Worker (webhook handler) |
| `/api/support/*` | Cloudflare Worker + Resend API |
| `/api/newsletter/*` | Cloudflare Worker + Resend API |
| `/ws/echo`, `/ws/inworld` | LiveKit |

---

## Environment Variables — Before and After

### Variables that disappear:
- `PORT`, `NODE_ENV`, `BACKEND_URL` — no more Express server
- `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS` — Parakeet replaces Google STT
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — LiveKit replaces Twilio
- `JWT_SECRET`, `JWT_EXPIRATION` — Supabase handles auth tokens
- `CORS_ORIGIN`, `WEBSOCKET_URL`, `API_URL` — no custom server to configure

### Variables that stay (but move):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — set in Workers as secrets
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — set in Workers as secrets
- `OPENAI_API_KEY` — move to Worker secrets (only if still used for features not yet ported)
- `RESEND_API_KEY`, `SUPPORT_EMAIL_TO` — set in Workers as secrets
- `RUNPOD_KOKORO_ENDPOINT`, `RUNPOD_KEY` — already in the natural-reader Worker
- `OPENROUTER_CODING_KEY` — already in the transcriber Worker

### New variables:
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` — for voice mode token generation
