# Connectionism: DigitalOcean Hosting + Domain Setup (MVP)

This guide deploys your landing page fast using **DigitalOcean App Platform** and captures emails with **self-hosted listmonk**.

## What you have now
- `index.html` in this project folder
- A listmonk-ready newsletter form on the page

## 1) Push this folder to GitHub

1. Create a new GitHub repo (for example: `connectionism-landing`)
2. From this folder, run:

```powershell
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/connectionism-landing.git
git push -u origin main
```

## 2) Create a static app in DigitalOcean

1. Open DigitalOcean → **App Platform** → **Create App**
2. Choose **GitHub** as source and select your repo
3. For resource type, choose **Static Site**
4. Build settings:
   - Build Command: leave empty
   - Output Directory: `/`
5. Set app name (for example `connectionism-landing`)
6. Click **Create Resources**

DigitalOcean will give you a `*.ondigitalocean.app` URL once deployed.

## 3) Connect your custom domain to landing page

1. In the app dashboard: **Settings** → **Domains** → **Add Domain**
2. Enter your domain (for example `connectionism.io`)
3. Add DNS records at your domain registrar exactly as shown by DigitalOcean
   - Usually `A` record for apex/root (`@`)
   - Usually `CNAME` for `www`
4. Wait for DNS propagation (can be minutes to a few hours)
5. Confirm domain status in DigitalOcean turns active

DigitalOcean will provision SSL automatically for the connected domain.

## 4) Deploy listmonk on a small DigitalOcean Droplet

Recommended minimum for MVP:
- Droplet: 1 vCPU / 1–2 GB RAM
- OS: Ubuntu 24.04 LTS
- Domain/subdomain for listmonk: `newsletter.yourdomain.com`

Install Docker + Compose on the droplet, then run listmonk + Postgres with a compose file.

Example `docker-compose.yml`:

```yaml
services:
   db:
      image: postgres:16
      restart: unless-stopped
      environment:
         POSTGRES_DB: listmonk
         POSTGRES_USER: listmonk
         POSTGRES_PASSWORD: change_me
      volumes:
         - listmonk_db:/var/lib/postgresql/data

   listmonk:
      image: ghcr.io/knadh/listmonk:latest
      restart: unless-stopped
      depends_on:
         - db
      ports:
         - "9000:9000"
      environment:
         LISTMONK_app__address: 0.0.0.0:9000
         LISTMONK_db__host: db
         LISTMONK_db__port: 5432
         LISTMONK_db__user: listmonk
         LISTMONK_db__password: change_me
         LISTMONK_db__database: listmonk
         LISTMONK_db__ssl_mode: disable

volumes:
   listmonk_db:
```

Then start:

```bash
docker compose up -d
```

Put Nginx or Caddy in front of listmonk and issue TLS for `newsletter.yourdomain.com`.

## 5) Create a public list in listmonk and wire the form

1. Open listmonk admin and create a **public** list.
2. Copy that list UUID.
3. In `index.html` update:
    - `action="https://newsletter.yourdomain.com/api/public/subscription"`
    - hidden input `name="l"` value to your list UUID.

This uses listmonk's public endpoint:
- `POST /api/public/subscription`
- Form fields: `email`, optional `name`, and one or more `l` values (list UUIDs).

## 6) DNS for listmonk

At your registrar, add records:
- `CNAME newsletter -> your_droplet_or_proxy_host`
- Keep apex/root and `www` pointed to App Platform as in step 3.

## 7) Quick post-deploy checks

- Open both `https://yourdomain.com` and `https://www.yourdomain.com`
- Confirm HTTPS lock is active
- Submit newsletter form with a test email
- Verify subscriber appears in listmonk and receives opt-in email (if enabled)

## 8) Optional next step after MVP

When you are ready, keep this as landing page and add:
- `/waitlist` page
- `/about` page
- analytics (privacy-friendly) and basic event tracking

---

If you want to keep using this folder as the main hub, keep this landing repo separate from your main application repo and just link them in your architecture docs.
