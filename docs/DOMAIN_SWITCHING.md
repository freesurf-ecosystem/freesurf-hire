## What You Still Need to Do Manually When Switching Domains

These are Cloudflare-side, not code:

[ ] wrangler.toml routes — change zone_name and pattern (2 files: links + post)
[ ] Cloudflare DNS — add new CNAME records for subdomains
[ ] Supabase dashboard — update redirect URLs
[ ] Google Search Console — add new domain property
[ ] App Store Connect / Play Console — update privacy policy URL, support URL
[ ] Rebuild + resubmit all mobile apps (needed anyway for store metadata)