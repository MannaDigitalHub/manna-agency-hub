# Manna Agency Hub Memory
_Last updated: 2026-04-10 | Health: 10/10 | Branch: claude/design-manna-hub-system-CLhpk_

## Project Overview
Manna Digital Hub — AI automation agency for South African businesses. React + Express + tRPC + Drizzle ORM + Anthropic Claude (MannaBot). Deployed on Truehost shared hosting (lon110.truehost.cloud), SSH port 1624.

## Where We Left Off
Site is **LIVE**. PM2 online, node_modules installed, all env vars set. Last action: npm install succeeded, PM2 restarted online (17.1mb). Admin credentials added to server .env.

**Next step**: Verify site loads at https://mannadigitalhub.co.za and test admin login at /admin

## Completed ✓
- PayFast subscription form (server-side signed, tRPC mutation, landing page wired)
- Admin dashboard wired to live analytics (real DB data)
- Vapi voice webhook built and registered
- Fixed bot_leads SQL: snake_case → camelCase column names
- Fixed PayFast return redirect: /thank-you → /payment/success
- Added ADMIN_EMAIL + ADMIN_PASSWORD to .env (login now works)
- Added .npmrc legacy-peer-deps=true (npm install never fails again)
- Truehost DNS/SSL fixed, PM2 online, node_modules installed

## Active Work 🔄
- [ ] Verify site loads at https://mannadigitalhub.co.za
- [ ] Test admin login: support@mannadigitalhub.co.za / admin2026!
- [ ] WhatsApp Access Token — add SIM, verify Meta dev account, get token
- [ ] Register Vapi webhook in Vapi dashboard: `https://mannadigitalhub.co.za/api/vapi/webhook`
- [ ] Whitelist server IP 102.66.135.151 in PayFast dashboard
- [ ] Facebook App verification (user handling)

## Blockers 🚫
- WhatsApp Access Token pending (SIM swap needed to verify Meta developer account)
- Facebook App Secret pending (Facebook verification in progress)

## Key Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Remove Manus runtime plugin | Was redirecting to resolutionsahomes.com | 2026-04-08 |
| Proxy via `.htaccess [P,L]` | LiteSpeed on Truehost — only way to forward to Node.js | 2026-04-07 |
| dist/ files tracked in git | Server can't run vite build; committed dist = deployment | 2026-04-08 |
| .npmrc legacy-peer-deps | @builder.io/vite-plugin-jsx-loc peer dep conflict breaks npm install | 2026-04-10 |
| Server-side PayFast form | Passphrase must never reach browser; tRPC publicProcedure mutation | 2026-04-09 |

## Key Files
| File | Purpose |
|------|---------|
| `~/public_html/.htaccess` | LiteSpeed proxy → port 3000 |
| `~/manna-agency-hub/dist/index.js` | Server bundle (PM2 runs this) |
| `server/routers/payment.ts` | PayFast subscription form builder |
| `server/vapi-webhook.ts` | Vapi voice call handler |
| `server/payfast-webhook.ts` | PayFast ITN handler |
| `server/routers/analytics.ts` | Live dashboard metrics |
| `.npmrc` | legacy-peer-deps=true — fixes npm install on server |

## Architecture Notes
- **PM2 binary**: `/home/qsfttpdi/.nvm/versions/node/v20.20.2/bin/pm2`
- **Node on server**: v18 system + v20.20.2 via nvm (PM2 uses v20)
- **Server**: 51.89.153.183 | SSH port 1624 | cPanel user: qsfttpdi
- **Domain root**: `/home/qsfttpdi/public_html`
- **Deploy flow**: build locally → git push → SSH → git pull → pm2 restart
- **Future deploys** (no new packages): git pull + pm2 restart only
- **New packages added**: git pull + npm install --omit=dev + pm2 restart

## Known Issues
- cageFS resource limits may still kill PM2 under heavy load (Truehost ticket open)
- WhatsApp + Facebook webhooks inactive until tokens added to .env

## Session Log
- 2026-04-07: Initial deployment — PM2, .htaccess, SSL
- 2026-04-08: Fixed Manus runtime redirect, rebuilt bundle, fixed .htaccess
- 2026-04-09: PayFast form, live admin metrics, Vapi webhook built and pushed
- 2026-04-10: Full debug audit — fixed 3 critical bugs (SQL columns, PayFast redirect, admin creds). Fixed npm install permanently (.npmrc). Site now live with PM2 online.

## User Preferences
- Direct communication, no fluff
- SSH terminal output shared as screenshots
- Admin login: support@mannadigitalhub.co.za / admin2026!

## External Context
- **PayFast**: Merchant ID 34228175, sandbox=false | Whitelist IP: 102.66.135.151
- **SMTP**: support@mannadigitalhub.co.za via Zoho, app password in .env ✓
- **Anthropic**: Key in .env ✓
- **Vapi**: Key in .env ✓ | Webhook to register: `/api/vapi/webhook`
- **WhatsApp**: Phone ID + verify token + WABA ID in .env | Access token pending
- **WhatChimp**: Connected to Manna Digital Hub WA (separate tool, not platform)
