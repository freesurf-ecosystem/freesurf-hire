### Add invoices app into stores

[ ] Email setup: You'll need to set up support@freesurf.tools as a real inbox at some point, but it doesn't block publishing — Apple just needs a support URL to exist.

### Runpod Setup's

# Set secrets (same API key for both, different endpoint IDs)
cd "C:\Code\freesurf workspace\freesurf-transcriber\worker"
npx wrangler secret put RUNPOD_API_KEY
npx wrangler secret put RUNPOD_ENDPOINT_ID

cd "C:\Code\freesurf workspace\freesurf-calorie-tracker\worker"
npx wrangler secret put RUNPOD_API_KEY
npx wrangler secret put RUNPOD_ENDPOINT_ID

# Transcriber (Whisper + pyannote) — freesurf-transcriber

[ ] 1. Get a HuggingFace token: https://huggingface.co/settings/tokens
2. Accept pyannote license: https://huggingface.co/pyannote/speaker-diarization-3.1

# Push the built image
docker push plantingmoon/freesurf-transcriber:latest

# Create RunPod endpoint → L4 24GB, 0/2 workers, idle 60s
Env var: HF_TOKEN = your HuggingFace token. GPU 16GB (T4 minimum, L4 better), 0 min / 2 max workers, idle 60s. Set env var HF_TOKEN = your HuggingFace token.

# Calorie tracker
## Push the built image
docker push plantingmoon/freesurf-calorietracker:latest

## Create RunPod endpoint → L4 24GB, 0/2 workers, idle 60s
No env vars needed. **GPU 24GB** (L4/A5000), 0 min / 2 max workers, idle 60s. No env vars needed. Model downloads at first cold start (~5 min to fetch 11B params). Note: First cold start downloads ~7GB of model weights. Subsequent warm requests skip this. Use L4 (24GB) — T4 (16GB) is too small for Llama 3.2 Vision 11B. To switch to Qwen2-VL 7B for T4 compatibility, change MODEL_ID in handler.py.

# Review / submit apps
[ ] Create metro portals / dev builds for all three
[ ] Go through the questionnaires / set up all three apps in each app store
[ ] Work on screenshots / icons
[ ] Submit to App Store (same flow as invoices):
1. Apple Developer → Certificates, Identifiers & Profiles → New identifier → tools.freesurf.reader
2. App Store Connect → New App → bundle: tools.freesurf.[tooltype], SKU: freesurf-[tool-type]-001
3. cd mobile && npx eas init (fills EAS project ID)
4. npx eas credentials → iOS → build credentials
5. npx eas build --platform ios --profile production
6. npx eas submit --platform ios

## Set up account with applovin

-----
Tomorrow

## Get Links functionality working

- [ ] Can you sign in and set up basic links? How are we saving this?
- [ ] Deploy Worker at `freesurf.tools` with R2 bucket `freesurf-profiles` + KV namespace
- [ ] Deploy dashboard to Cloudflare Pages at `links.freesurf.tools`
- [ ] Update `API_BASE` in `dashboard/js/app.js`
- [ ] Get basic mobile app running
- [ ] Create app icons  — `mobile/assets/icon.png`
- [ ] Create screenshots for App Store / Play Store

### Get post functionality working

- [ ] Test sending from different accounts
- [ ] Deploy Worker with OAuth secrets
- [ ] Deploy dashboard to Cloudflare Pages at `post.freesurf.tools`
- [ ] Create app icons  — `mobile/assets/icon.png`
- [ ] Create screenshots for App Store / Play Store

---

### Start working on first open source english tutor set up

# Migrations

## Emmaline / Voice Assistant

- [ ] Migrate oov servers to Cloudflare Workers
- [ ] Disconnect oov from DigitalOcean
- [ ] Delete unnecessary Planting Moon team
- [ ] Rebrand as FreeSurf Voice Assistant
- [ ] Resubmit update to App Store
- [ ] Migrate database files to the shared supabase database

## Feedfree - Migrate to the freesurf database / unsubscribe from the supabase sub

## Migrate from pages components to workers where it makes sense

---

# DNS Migration Steps

1. Connect a new domain / update the name servers
2. Add all the cnames for each subdomain and link to the underlying cloudflare page (ex. cname, invoices links to freesurf-invoices.pages.dev)
3. Switch out the custom domains associated with each cloudflare page/ worker
4. Update Resend sender domain
5. Remove old sites / add new sitemaps to google search console

