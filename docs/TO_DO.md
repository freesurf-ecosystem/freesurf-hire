
[ ] Email setup: You'll need to set up support@freesurf.tools as a real inbox at some point, but it doesn't block publishing — Apple just needs a support URL to exist.
# Review / submit apps
[ ] Go through the questionnaires / set up all three apps in each app store
[ ] Work on screenshots / icons
[ ] Icons
[ ] Submit to App Store:
1. Apple Developer → Certificates, Identifiers & Profiles → New identifier → tools.freesurf.reader
2. App Store Connect → New App → bundle: tools.freesurf.[tooltype], SKU: freesurf-[tool-type]-001
3. cd mobile && npx eas init (fills EAS project ID)
4. npx eas credentials → iOS → build credentials
5. npx eas build --platform ios --profile production
6. npx eas submit --platform ios
# Set up admob mediation
[ ] Set up account with applovin


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
## Post functionality working
- [ ] Test sending from different accounts
- [ ] Deploy Worker with OAuth secrets
- [ ] Deploy dashboard to Cloudflare Pages at `post.freesurf.tools`
- [ ] Create app icons  — `mobile/assets/icon.png`
- [ ] Create screenshots for App Store / Play Store
## Social Media Work
[ ] When / if apps start to get published, need to go ahead and reach out to influencers or put together a regular video posting schedule
## Start working on open source english tutor set up
- [ ] Rebranding the oov app to the english tutor app for now
# Migrations
## Emmaline / Voice Assistant
- [ ] Migrate oov servers to Cloudflare Workers
- [ ] Disconnect oov from DigitalOcean
- [ ] Delete unnecessary Planting Moon team
- [ ] Rebrand as FreeSurf Voice Assistant
- [ ] Resubmit update to App Store
- [ ] Migrate database files to the shared supabase database
## Feedfree 
[ ] Migrate to the freesurf database / unsubscribe from the supabase sub
## Pages components
[ ] Migrate from pages components to workers where it makes sense

---

# DNS Migration Steps

1. Connect a new domain / update the name servers
2. Add all the cnames for each subdomain and link to the underlying cloudflare page (ex. cname, invoices links to freesurf-invoices.pages.dev)
3. Switch out the custom domains associated with each cloudflare page/ worker
4. Update Resend sender domain
5. Remove old sites / add new sitemaps to google search console

