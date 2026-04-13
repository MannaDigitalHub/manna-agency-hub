# Manna Agency Hub Memory
_Last updated: 2026-04-13 | Health: 9/10 | Branch: claude/design-manna-hub-system-CLhpk_

## Project Overview
Manna Digital Hub — AI automation agency for South African businesses. React + Express + tRPC + Drizzle ORM. MannaBot uses Groq (free, llama-3.1-8b-instant) as primary AI; Anthropic + Gemini as fallbacks. Deployed on Truehost shared hosting, SSH port 1624.

## Where We Left Off
Admin login form now shows at `/admin/login` (routing fixed). Login was failing with **"crypto is not defined"** — fixed by replacing `jose` with native `node:crypto` HMAC-SHA256 JWT in `sdk.ts` and `clientAuth.ts`. Fix pushed, **not yet deployed**.

**Next step — run on server:**
```bash
cd ~/manna-agency-hub && git pull origin claude/design-manna-hub-system-CLhpk && ~/.nvm/versions/node/v20.20.2/bin/pm2 restart manna-hub
```
Then test: `https://mannadigitalhub.co.za/admin/login` → credentials in User Preferences below.

**One DB migration still needed (run once in phpMyAdmin):**
```sql
ALTER TABLE subscriptions MODIFY COLUMN packageName ENUM('starter','chatbot','social','complete','fullsuite') NOT NULL;
```

## Completed ✓
- MannaBot working via Groq free tier (llama-3.1-8b-instant)
- UI: lime brand, 5 service cards, 5 pricing plans, website callout block
- PayFast: 5 plans signed server-side; PLAN_AMOUNTS + schema enum fixed
- Routing fix: `path=""` → `path="/"` (LandingPage was hijacking all routes)
- Admin login: `upsertUser` made non-fatal (users table may not exist)
- **jose removed**: replaced with `node:crypto` HMAC-SHA256 in sdk.ts + clientAuth.ts
- `crypto.randomUUID()` bare global fixed in botLeads.ts → `randomUUID` from `node:crypto`
- Admin auth bypass in sdk.ts (no DB needed for admin JWT)
- Cookie sameSite dynamic, trust proxy=1, horizontal scrollbar fixed

## Active Work 🔄
- [ ] **Deploy latest fixes** (see command above) — then test admin login
- [ ] Run subscriptions ALTER TABLE migration in phpMyAdmin
- [ ] WhatsApp Access Token (pending SIM swap)
- [ ] Register Vapi webhook: `https://mannadigitalhub.co.za/api/vapi/webhook`
- [ ] Whitelist server IP `102.66.135.151` in PayFast dashboard
- [ ] Add Anthropic credits (Groq works as fallback in the meantime)
- [ ] Regenerate Groq API key (was shared in chat, visible in screenshot)
- [ ] Regenerate Gemini API key (was shared in chat)

## Blockers 🚫
- **Admin login**: fix pushed but not deployed yet
- **WhatsApp sending**: Access Token pending SIM swap (Meta developer verification)
- **Facebook**: App Secret pending verification

## Key Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Lime brand color | User feedback | 2026-04-10 |
| Admin auth bypass DB | users table may not exist; JWT is source of truth | 2026-04-10 |
| Groq as bot primary | Free tier, fast; Anthropic fallback when credits added | 2026-04-10 |
| node:crypto not jose | jose v6 uses bare `crypto` global — not available on Truehost | 2026-04-13 |
| trust proxy = 1 not true | express-rate-limit rejects "true" as too permissive | 2026-04-10 |
| dist/ tracked in git | Server can't run vite build | 2026-04-08 |

## Key Files
| File | Purpose |
|------|---------|
| `server/routers/aiChat.ts` | MannaBot — Groq primary, Anthropic + Gemini fallbacks |
| `server/_core/sdk.ts` | Admin JWT via node:crypto HMAC-SHA256; admin bypass ~line 270 |
| `server/_core/clientAuth.ts` | Client portal JWT — also node:crypto now |
| `server/_core/index.ts` | Express setup — trust proxy=1, rate limiters |
| `server/routers.ts` | Admin auth.login — upsertUser try-catched |
| `server/payfast-webhook.ts` | PayFast ITN — PLAN_AMOUNTS aligned with payment.ts |
| `client/src/pages/LandingPage.tsx` | Landing — 5 services, 5 pricing, website callout |
| `client/src/App.tsx` | Wouter routing — path="/" fixed (was "") |
| `server/routers/payment.ts` | PayFast: 5 plans with correct amounts |
| `~/public_html/.htaccess` | LiteSpeed proxy → port 3000 |

## Architecture Notes
- **PM2**: `~/.nvm/versions/node/v20.20.2/bin/pm2 restart manna-hub`
- **Server**: 51.89.153.183 | SSH port 1624 | user: qsfttpdi
- **Deploy**: build locally → `git push` → SSH → `git pull` → `pm2 restart`
- **Bot flow**: Groq (llama-3.1-8b-instant) → Anthropic → Gemini → error
- **JWT**: HS256 via `node:crypto` createHmac — no jose dependency

## Pricing Reference
| Plan | Setup | Monthly | Key |
|------|-------|---------|-----|
| WhatsApp Starter | R3,500 | R1,200 | `starter` |
| AI Website Chatbot | R4,000 | R950 | `chatbot` |
| Social Media AI | R3,500 | R2,000 | `social` |
| AI Complete ★ | R9,500 | R2,800 | `complete` |
| Full Suite | R15,000 | R4,500 | `fullsuite` |

## Known Issues
- `users` table may not exist in MySQL (admin auth bypassed; OAuth users still need it)
- cageFS resource limits may kill PM2 under heavy load (Truehost)
- Groq API key visible in previous SSH screenshot — needs rotation

## Session Log
- 2026-04-07: Initial deployment — PM2, .htaccess, SSL
- 2026-04-09: PayFast form, live admin metrics, Vapi webhook
- 2026-04-10: UI overhaul, backend fixes — model ID, admin auth, cookies, Groq fallback
- 2026-04-13: Routing fix, PayFast amounts fix, jose → node:crypto, admin login fixes

## User Preferences
- Direct communication, no fluff
- SSH terminal shared as screenshots
- Admin credentials: support@mannadigitalhub.co.za / admin2026!
- PM2 path required in full (nvm not loaded in non-interactive shells)

## External Services
| Service | Status | Notes |
|---------|--------|-------|
| Anthropic | ✓ key | Zero credits — Groq handles bot for now |
| Groq | ✓ key | Free tier, working — regenerate key (was exposed) |
| Gemini | ✓ key | Fallback — regenerate key (was exposed) |
| PayFast | ✓ | Merchant ID 34228175, sandbox=false; whitelist 102.66.135.151 |
| SMTP | ✓ | support@mannadigitalhub.co.za via Zoho |
| Vapi | ✓ key | Webhook not yet registered in Vapi dashboard |
| WhatsApp | ⏳ | Phone ID + verify token ✓; Access token pending SIM swap |
