# FreeSurf Migration — Task List

repository names


https://github.com/freesurf-ecosystem/freesurf-post
https://github.com/freesurf-ecosystem/freesurf-links
https://github.com/freesurf-ecosystem/freesurf-invoices
https://github.com/freesurf-ecosystem/freesurf-scanner
https://github.com/freesurf-ecosystem/freesurf-auth
https://github.com/freesurf-ecosystem/freesurfer-ide


Secrets to isolate


Secret BUNDLE_TEAM_ID
	
Plaintext ENVIRONMENT production
	
Secret SOCIAL_API_PROVIDER_KEY
	
Secret SUPABASE_JWT_SECRET
	
Secret RESEND_API_KEY

Both wrangler.toml files already have the new names and routes. You just need to:
1. npx wrangler deploy in each repo
2. npx wrangler secret put <NAME> for every secret the old workers had
3. Remove the old cnxt-to-post and links-by-cnxt workers from the dashboard 

## Deploy Tasks (per app)

### Links
- [ ] Deploy Worker at `freesurf.tools` with R2 bucket `freesurf-profiles` + KV namespace
- [ ] Deploy dashboard to Cloudflare Pages at `links.freesurf.tools`
- [ ] Update `API_BASE` in `dashboard/js/app.js`

### Post
- [ ] Deploy Worker with OAuth secrets
- [ ] Deploy dashboard to Cloudflare Pages at `post.freesurf.tools`

---

## Icons & Store Assets

- [ ] Create app icons (1024x1024 PNG) for each app — `mobile/assets/icon.png`
- [ ] Create screenshots for App Store / Play Store
- [ ] Set up reviewer credentials where needed

### Natural Reader
- [ ] Deploy Worker at `reader.freesurf.tools` — set `RUNPOD_API_KEY` + `RUNPOD_ENDPOINT_ID` secrets
- [ ] Update `TTS_WORKER_URL` in `lib/tts.ts` to deployed URL

### Transcriber
- [ ] Deploy Worker at `transcribe.freesurf.tools` — set `OPENROUTER_API_KEY` secret

---

## Emmaline / Voice Assistant

- [ ] Migrate oov servers to Cloudflare Workers
- [ ] Disconnect oov from DigitalOcean
- [ ] Delete unnecessary Planting Moon team
- [ ] Rebrand as FreeSurf Voice Assistant
- [ ] Resubmit update to App Store

---

# DNS Migration Steps

1. Connect a new domain / update the name servers
2. Add all the cnames for each subdomain and link to the underlying cloudflare page (ex. cname, invoices links to freesurf-invoices.pages.dev)
3. Switch out the custom domains associated with each cloudflare page
4. Update Resend sender domain
5. Remove old sites / add new sitemaps to google search console