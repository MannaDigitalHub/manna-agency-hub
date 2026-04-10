# Manna Agency Hub Memory
_Last updated: 2026-04-10 | Health: 7/10 | Branch: claude/design-manna-hub-system-CLhpk_

## Project Overview
Manna Digital Hub — AI automation agency for South African businesses. React + Express + tRPC + Drizzle ORM + Anthropic Claude (MannaBot). Deployed on Truehost shared hosting (lon110.truehost.cloud), SSH port 1624.

## Where We Left Off
Bot (MannaBot) still returning fallback message. Root cause: Anthropic has zero credits; Gemini fallback added but ALL 7 model names return 404 from Google API — likely the "Generative Language API" is not enabled in the Google Cloud project for the AI Studio key.

**Immediate next steps (in order):**
1. Enable Generative Language API: `console.cloud.google.com` → select project → search "Generative Language API" → Enable
2. OR check if Ollama is on the server: `curl -s localhost:11434/api/version`
3. After enabling: `git pull` + `pm2 restart` (new 7-model fallback code already pushed)
4. Test admin login at `/admin/login` (credentials: see User Preferences below)

## Completed ✓
- UI overhaul: lime brand colors, 5 service cards, 5 pricing plans, admin login link
- PayFast subscription form (server-side signed, tRPC mutation)
- Admin dashboard wired to live analytics (real DB data)
- Vapi voice webhook built
- Fixed bot_leads SQL: snake_case → camelCase column names
- Fixed trust proxy: `app.set("trust proxy", 1)` (fixes rate-limit ValidationError)
- Fixed chatbot model ID: `claude-haiku-4-5-20251001`
- Fixed admin auth: bypass DB for openId==="admin" (no users table needed)
- Fixed cookie: sameSite dynamic (none on HTTPS, lax on HTTP)
- Fixed ChatBot widget: emerald → lime colors
- Fixed client: always show bot message even when success:false
- Removed cache_control from system prompt (required beta header, caused 400)
- Added Gemini fallback with 7 model candidates (code deployed, API not yet enabled)
- Marquee spacing increased, horizontal scrollbar killed (html+body overflow-x:hidden)

## Active Work 🔄
- [ ] Enable Generative Language API in Google Cloud Console for the AI Studio project
- [ ] Confirm admin login works (should work after last auth fix)
- [ ] Add Anthropic credits OR verify Gemini once API is enabled
- [ ] WhatsApp Access Token (pending SIM swap)
- [ ] Register Vapi webhook in Vapi dashboard: `https://mannadigitalhub.co.za/api/vapi/webhook`
- [ ] Whitelist server IP 102.66.135.151 in PayFast dashboard
- [ ] Update subscriptions.packageName enum in schema to include 'complete' + 'fullsuite'

## Blockers 🚫
- **BOT**: Anthropic = zero credits. Gemini fallback added but Generative Language API not enabled in Google Cloud project → all 404
- **WhatsApp**: Access Token pending SIM swap to verify Meta developer account
- **Facebook**: App Secret pending verification

## Key Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Lime brand color (not emerald) | User feedback | 2026-04-10 |
| Admin auth bypass DB | users table may not exist; JWT is source of truth for admin | 2026-04-10 |
| Gemini fallback (not primary) | Free tier; auto-switches back to Anthropic when credits added | 2026-04-10 |
| trust proxy = 1 not true | express-rate-limit rejects "true" as too permissive | 2026-04-10 |
| dist/ tracked in git | Server can't run vite build | 2026-04-08 |
| .npmrc legacy-peer-deps | peer dep conflict breaks npm install | 2026-04-10 |

## Key Files
| File | Purpose |
|------|---------|
| `server/routers/aiChat.ts` | MannaBot — Anthropic primary, Gemini fallback (7 model candidates) |
| `server/_core/sdk.ts` | Auth — admin bypass at line ~270 |
| `server/_core/index.ts` | Express setup — trust proxy=1, rate limiters |
| `server/_core/cookies.ts` | Cookie options — sameSite dynamic |
| `client/src/components/ChatBot.tsx` | Chat widget — lime colors, always shows bot message |
| `client/src/pages/LandingPage.tsx` | Landing page — 5 services, 5 pricing, admin link |
| `client/src/index.css` | Lime brand colors (oklch hue 120) |
| `server/routers/payment.ts` | PayFast: 5 plans |
| `~/public_html/.htaccess` | LiteSpeed proxy → port 3000 |

## Architecture Notes
- **PM2 binary**: `/home/qsfttpdi/.nvm/versions/node/v20.20.2/bin/pm2`
- **PM2 restart**: `~/.nvm/versions/node/v20.20.2/bin/pm2 restart manna-hub`
- **Server**: 51.89.153.183 | SSH port 1624 | user: qsfttpdi
- **Deploy**: build locally → git push → SSH → git pull → pm2 restart
- **Gemini API key**: in .env as GEMINI_API_KEY (added 2026-04-10)
- **Bot flow**: Anthropic → Gemini fallback → error message if both fail

## Pricing Reference
| Plan | Setup | Monthly | Key |
|------|-------|---------|-----|
| WhatsApp Starter | R3,500 | R1,200 | `starter` |
| AI Website Chatbot | R4,000 | R950 | `chatbot` |
| Social Media AI | R3,500 | R2,000 | `social` |
| AI Complete ★ | R9,500 | R2,800 | `complete` |
| Full Suite | R15,000 | R4,500 | `fullsuite` |

## Known Issues
- subscriptions.packageName enum in schema.ts missing 'complete' + 'fullsuite' (PayFast subscriptions will fail for new plans)
- users table may not exist in MySQL (admin auth bypassed in code; OAuth users still need it)
- cageFS resource limits may kill PM2 under heavy load (Truehost)

## Session Log
- 2026-04-07: Initial deployment — PM2, .htaccess, SSL
- 2026-04-08: Fixed Manus runtime redirect, rebuilt bundle
- 2026-04-09: PayFast form, live admin metrics, Vapi webhook
- 2026-04-10: UI overhaul — lime, 5 services, 5 pricing, admin link
- 2026-04-10: Deep backend fixes — model ID, cache_control, admin auth, cookies, Gemini fallback

## User Preferences
- Direct communication, no fluff
- SSH terminal shared as screenshots
- Admin credentials: support@mannadigitalhub.co.za / admin2026!
- PM2 path required in full (nvm not loaded in non-interactive shells)

## External Services
- **Anthropic**: Key in .env ✓ — zero credits, need top-up OR use Gemini
- **Gemini**: Key in .env ✓ (AIzaSyBo...ArA — regenerate this, it was shared in chat!)
- **PayFast**: Merchant ID 34228175, sandbox=false | Whitelist IP: 102.66.135.151
- **SMTP**: support@mannadigitalhub.co.za via Zoho ✓
- **Vapi**: Key in .env ✓
- **WhatsApp**: Phone ID + verify token in .env | Access token pending
