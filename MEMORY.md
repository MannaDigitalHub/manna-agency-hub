# Manna Agency Hub Memory
_Last updated: 2026-04-08 | Health: 8/10 | Branch: claude/design-manna-hub-system-CLhpk_

## Project Overview
Manna Digital Hub — AI automation agency for South African businesses. React + Express + tRPC + Drizzle ORM + Anthropic Claude (MannaBot). Deployed on Truehost shared hosting (lon110.truehost.cloud), SSH port 1624.

## Where We Left Off
Site returns **403 Forbidden** because PM2 got killed by cageFS resource limits → port 3000 went down → LiteSpeed proxy returns 403. The code is correct. PM2 needs to be restarted once resource limits clear.

**Next step**: Wait ~5-10 min, then restart PM2:
```bash
/home/qsfttpdi/.nvm/versions/node/v20.20.2/bin/pm2 kill
/home/qsfttpdi/.nvm/versions/node/v20.20.2/bin/pm2 start ~/manna-agency-hub/dist/index.js --name manna-hub
/home/qsfttpdi/.nvm/versions/node/v20.20.2/bin/pm2 save
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
- [ ] Restart PM2 after resource limits clear
- [ ] Contact Truehost support to increase cageFS process limits (recurring issue)
- [ ] Verify site loads at https://mannadigitalhub.co.za
- [ ] Test admin login, MannaBot chatbot, PayFast payments

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
- 2026-04-08: Found manna-api (wrong app) competing on port 3000, caused resolutionsahomes.com redirect. Root cause: Manus runtime script in index.html. Removed runtime, fixed getLoginUrl, rebuilt and deployed. Fixed Force HTTPS loop in .htaccess. Site returns 403 (PM2 down due to resource limits) — redirect is fixed, just needs PM2 restart.

## User Preferences
- Direct communication, no fluff
- Share SSH terminal output as screenshots
- Truehost cPanel at https://lon110.truehost.cloud:2083

## External Context
- **Truehost support ticket**: Open — requested process limit increase and PM2 stabilisation
- **PayFast**: Merchant ID 34228175, sandbox=false (live payments)
- **Anthropic API**: Key in .env for MannaBot chatbot
- **WhatsApp integration**: Deferred — not yet configured
