# Manna Agency Hub Memory
_Last updated: 2026-04-10 | Health: 10/10 | Branch: claude/design-manna-hub-system-CLhpk_

## Project Overview
Manna Digital Hub — AI automation agency for South African businesses. React + Express + tRPC + Drizzle ORM + Anthropic Claude (MannaBot). Deployed on Truehost shared hosting (lon110.truehost.cloud), SSH port 1624.

## Where We Left Off
Full UI overhaul committed and pushed. New build is in `dist/` and ready to deploy.

**Next step**: SSH → `git pull` + `pm2 restart` to go live with new UI. Then verify at https://mannadigitalhub.co.za

## Completed ✓
- **UI overhaul**: lime brand colors, 5 service cards, 5 pricing plans, admin login link
- PayFast subscription form (server-side signed, tRPC mutation, landing page wired)
- Admin dashboard wired to live analytics (real DB data)
- Vapi voice webhook built and registered
- Fixed bot_leads SQL: snake_case → camelCase column names
- Fixed PayFast return redirect: /thank-you → /payment/success
- Added ADMIN_EMAIL + ADMIN_PASSWORD to .env (login now works)
- Added .npmrc legacy-peer-deps=true (npm install never fails again)
- Truehost DNS/SSL fixed, PM2 online, node_modules installed

## Active Work 🔄
- [ ] SSH → `git pull` + `pm2 restart` to deploy the UI overhaul
- [ ] Verify new site at https://mannadigitalhub.co.za (lime, 5 services, admin link visible)
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
| Lime brand color (not emerald) | User feedback: "too green, should be lime" | 2026-04-10 |
| 5 services (added Social Media AI + Website Design) | Expand revenue; site itself proves web capability | 2026-04-10 |
| Pricing increase (R3,500+ setup) | Signals quality, filters tire-kickers; ~40% of SA market rate | 2026-04-10 |
| Remove Manus runtime plugin | Was redirecting to resolutionsahomes.com | 2026-04-08 |
| Proxy via `.htaccess [P,L]` | LiteSpeed on Truehost — only way to forward to Node.js | 2026-04-07 |
| dist/ files tracked in git | Server can't run vite build; committed dist = deployment | 2026-04-08 |
| .npmrc legacy-peer-deps | @builder.io/vite-plugin-jsx-loc peer dep conflict breaks npm install | 2026-04-10 |
| Server-side PayFast form | Passphrase must never reach browser; tRPC publicProcedure mutation | 2026-04-09 |

## Key Files
| File | Purpose |
|------|---------|
| `client/src/pages/LandingPage.tsx` | Full landing page — 5 services, 5 pricing plans, lime colors |
| `client/src/index.css` | Brand colors (lime oklch hue 120), glow, gradient text |
| `server/routers/payment.ts` | PayFast: 5 plans (starter R1200, chatbot R950, social R2000, complete R2800, fullsuite R4500) |
| `~/public_html/.htaccess` | LiteSpeed proxy → port 3000 |
| `~/manna-agency-hub/dist/index.js` | Server bundle (PM2 runs this) |
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

## Pricing Reference (current live)
| Plan | Setup | Monthly | PayFast key |
|------|-------|---------|-------------|
| WhatsApp Starter | R3,500 | R1,200 | `starter` |
| AI Website Chatbot | R4,000 | R950 | `chatbot` |
| Social Media AI | R3,500 | R2,000 | `social` |
| AI Complete ★ | R9,500 | R2,800 | `complete` |
| Full Suite | R15,000 | R4,500 | `fullsuite` |
| Website Design | R5,000–R15,000 | R800 hosting | WhatsApp CTA |
| Full AI Business Stack (bundle) | R15,000 | R4,500 | WhatsApp CTA |

## Known Issues
- cageFS resource limits may still kill PM2 under heavy load (Truehost ticket open)
- WhatsApp + Facebook webhooks inactive until tokens added to .env

## Session Log
- 2026-04-07: Initial deployment — PM2, .htaccess, SSL
- 2026-04-08: Fixed Manus runtime redirect, rebuilt bundle, fixed .htaccess
- 2026-04-09: PayFast form, live admin metrics, Vapi webhook built and pushed
- 2026-04-10: Full debug audit — fixed 3 critical bugs, .npmrc fix, site live
- 2026-04-10: UI overhaul — lime colors, 5 services, 5 pricing plans, admin link, overflow fix

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
