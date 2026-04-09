# Manna Agency Hub Memory
_Last updated: 2026-04-09 | Health: 9/10 | Branch: claude/design-manna-hub-system-CLhpk_

## Project Overview
Manna Digital Hub — AI automation agency for South African businesses. React + Express + tRPC + Drizzle ORM + Anthropic Claude (MannaBot). Deployed on Truehost shared hosting (lon110.truehost.cloud), SSH port 1624.

## Where We Left Off
All 3 revenue features built and pushed (commit 9cc3453). Waiting for:
1. Truehost routing fix (site still 403 — port 3000 blocked)
2. WhatsApp Access Token (user adding sim tomorrow to verify Meta dev account)

**Next step when Truehost fixes routing:**
```bash
cd ~/manna-agency-hub && git pull origin claude/design-manna-hub-system-CLhpk
/home/qsfttpdi/.nvm/versions/node/v20.20.2/bin/pm2 restart manna-hub
```

## Completed ✓
- Removed `vite-plugin-manus-runtime` from `vite.config.ts` (was causing redirect to resolutionsahomes.com)
- Fixed `getLoginUrl()` in `client/src/const.ts` to return `"/admin"` fallback instead of throwing
- Rebuilt app — new index.html is 1.18kB (was 368kB with Manus runtime)
- Deployed new bundle to server via git (branch: `claude/design-manna-hub-system-CLhpk`)
- Confirmed redirect to resolutionsahomes.com is FIXED (site now returns 403, not redirect)
- Fixed `.htaccess` — proxy-only, no Force HTTPS rule (Force HTTPS loop was causing 403)
- SSL certificate installed for mannadigitalhub.co.za via cPanel AutoSSL
- crontab set: `@reboot source ~/.nvm/nvm.sh && pm2 resurrect`

## Active Work 🔄
- [ ] Truehost fix routing (ticket open) → then `git pull` + `pm2 restart`
- [ ] WhatsApp Access Token — user adding SIM tomorrow to verify Meta dev account
- [ ] Add `VAPI_WEBHOOK_SECRET` to .env (optional but recommended for security)
- [ ] Register Vapi webhook URL in Vapi dashboard: `https://mannadigitalhub.co.za/api/vapi/webhook`

## Blockers 🚫
- **cageFS resource limits** — Truehost shared hosting kills PM2 under load. Must contact support to fix permanently.
- **OAUTH_SERVER_URL not configured** — non-fatal warning, Manus OAuth not set up. Admin auth currently falls back to `/admin` route.

## Key Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Remove Manus runtime plugin | `vite-plugin-manus-runtime` injected a script that redirected to resolutionsahomes.com OAuth portal when running outside Manus platform | 2026-04-08 |
| Proxy via `.htaccess [P,L]` | LiteSpeed on Truehost doesn't support Passenger; `[P]` proxy flag forwards to Node.js on port 3000 | 2026-04-07 |
| getLoginUrl returns "/admin" fallback | Prevents crash when VITE_OAUTH_PORTAL_URL is not set; admin auth not yet configured | 2026-04-08 |
| No Force HTTPS in .htaccess | cPanel Force HTTPS toggle handles HTTP→HTTPS at LiteSpeed vhost level; putting it in .htaccess caused infinite redirect loop (403) | 2026-04-08 |
| dist/ files tracked in git for deployment | Server can't run `npm run build` (vite not in PATH); committing built assets is the deployment mechanism | 2026-04-08 |

## Key Files
| File | Purpose |
|------|---------|
| `~/public_html/.htaccess` | LiteSpeed proxy rule — forwards all requests to port 3000 |
| `~/manna-agency-hub/dist/index.js` | Server bundle — what PM2 runs |
| `~/manna-agency-hub/dist/public/index.html` | Client HTML — 1.18kB, no Manus runtime |
| `~/manna-agency-hub/dist/public/assets/index-BqoI3a_y.js` | Client JS bundle — current clean build |
| `~/manna-agency-hub/.env` | Production env vars (DB, JWT, PayFast, SITE_URL) |
| `client/src/const.ts` | getLoginUrl() — now returns /admin fallback |
| `vite.config.ts` | vite-plugin-manus-runtime removed |

## Architecture Notes
- **PM2 binary full path required**: `/home/qsfttpdi/.nvm/versions/node/v20.20.2/bin/pm2` (nvm not loaded in non-interactive shells)
- **Node version**: v20.20.2 via nvm
- **Server**: lon110.truehost.cloud (IP: 51.89.153.183), CloudLinux 9.7, cageFS
- **cPanel user**: qsfttpdi | SSH port: 1624
- **Domain**: mannadigitalhub.co.za is the MAIN domain, document root = `/home/qsfttpdi/public_html`
- **No cPanel redirects configured** (confirmed in cPanel → Redirects)
- **resolutionsahomes.com** is a separate site on the same server — was competing on port 3000 via `manna-api` PM2 process (now gone)
- **Manus OAuth**: App was built on Manus platform — `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID` all unset. Admin auth doesn't work yet.
- **Build on server fails**: `npm run build` fails with "vite: command not found" — must build locally and commit dist files

## Known Issues
- Admin dashboard login broken — Manus OAuth not configured, no alternative auth set up
- `OAUTH_SERVER_URL` missing generates repeated error logs (non-fatal)
- Stale files in `dist/public/assets/`: `index-LM2fZ5p3.js`, `index-CmotAhFI.css` (old builds, safe to delete)
- cageFS resource limits hit repeatedly under load — need Truehost support to raise limits

## Session Log
- 2026-04-07: Initial deployment attempt — set up PM2, .htaccess proxy, SSL
- 2026-04-08: Fixed Manus runtime redirect, rebuilt bundle, fixed .htaccess
- 2026-04-09: Collected env vars (SMTP, Vapi, WA IDs, PayFast confirmed). Built PayFast subscription form (server-side signed, public tRPC mutation), wired admin dashboard to live analytics, built Vapi voice webhook. All pushed (9cc3453).

## User Preferences
- Direct communication, no fluff
- Share SSH terminal output as screenshots
- Truehost cPanel at https://lon110.truehost.cloud:2083

## External Context
- **Truehost support ticket**: Open — routing conflict blocking port 3000
- **PayFast**: Merchant ID 34228175, sandbox=false, passphrase confirmed, server IP 102.66.135.151 needs whitelisting in PayFast dashboard
- **Anthropic API**: Key in .env ✓
- **SMTP (Zoho)**: support@mannadigitalhub.co.za, app password in .env ✓
- **Vapi**: API key in .env ✓ | Webhook URL to register: `/api/vapi/webhook`
- **WhatsApp**: Phone number ID + verify token + WABA ID in .env | Access token pending (user getting SIM tomorrow)
- **WhatChimp**: Connected to Manna Digital Hub WA account (separate from platform)
