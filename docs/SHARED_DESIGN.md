# Shared Design

On sharing design across repos: Yes, the simplest approach for your static HTML setup is a CDN-hosted shared stylesheet:
1. Create a freesurf-design repo with CSS variables, grid pattern, button styles, typography
2. Deploy it as a Cloudflare Pages site (e.g., design.freesurf.tools)
3. Every other site links <link rel="stylesheet" href="https://design.freesurf.tools/freesurf.css">
4. Change the file once, redeploy — all sites update instantly
No npm, no build step, no versioning headaches. Much simpler than git submodules or packages for your stack.