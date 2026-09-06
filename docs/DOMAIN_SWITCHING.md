## What You Still Need to Do Manually When Switching Domains

These are Cloudflare-side, not code:

[ ] wrangler.toml routes — change zone_name and pattern (2 files: links + post)
[ ] Cloudflare DNS — add new CNAME records for subdomains
[ ] Supabase dashboard — update redirect URLs
[ ] Google Search Console — add new domain property
[ ] App Store Connect / Play Console — update privacy policy URL, support URL
[ ] Rebuild + resubmit all mobile apps (needed anyway for store metadata)

# DNS Migration Steps

1. Connect a new domain / update the name servers
2. Add all the cnames for each subdomain and link to the underlying cloudflare page (ex. cname, invoices links to freesurf-invoices.pages.dev)
3. Switch out the custom domains associated with each cloudflare page/ worker
4. Update Resend sender domain
5. Remove old sites / add new sitemaps to google search console