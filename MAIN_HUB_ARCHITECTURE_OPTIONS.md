# Connectionism Main Hub: Simple Architecture

## Goal
Use this repo as the **main hub** for the project while keeping small tools in their own repos when useful.

## Recommended Setup (Simple)
Use a **hybrid model**:
- Main hub repo: landing page, docs, shared contracts, integration notes.
- Separate repos: standalone tools/services that may evolve independently.
- Newsletter stack: self-hosted **listmonk**.

This gives you fast MVP progress now without locking you into one giant repo.

## Minimal Folder Layout

```text
connectionism/
  docs/
  contracts/
  integration/
  infra/
  index.html
  DIGITALOCEAN_HOSTING_GUIDE.md
  MAIN_HUB_ARCHITECTURE_OPTIONS.md
```

## Where listmonk Fits

- Landing page (`index.html`) collects email.
- Form posts to listmonk public endpoint:
  - `POST /api/public/subscription`
- Required fields:
  - `email`
  - `l` (list UUID, can be repeated for multiple lists)
- listmonk handles subscriber storage and opt-in flow.

In your landing page, set:
- `action="https://newsletter.yourdomain.com/api/public/subscription"`
- Hidden input `name="l"` with your public list UUID.

## Hosting Model (DigitalOcean)

- **App Platform**: host public landing page at `yourdomain.com`.
- **Droplet**: run listmonk + Postgres at `newsletter.yourdomain.com`.
- Keep both under the same domain family for trust and simple branding.

## Simple Decision Rule

- If code must ship together often -> keep it in main hub.
- If a tool can ship on its own -> keep it in a separate repo.

## Next Steps (MVP)

1. Push this landing project to GitHub.
2. Deploy landing page on DigitalOcean App Platform.
3. Deploy listmonk on a droplet.
4. Create one public list in listmonk.
5. Add that list UUID in `index.html` and test signup.
