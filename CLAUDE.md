# Manna Agency Hub — CLAUDE.md (Project Memory Bank)

## Project Overview
AI-powered CRM and automation hub for **Manna Digital Hub** — a South African AI automation agency.  
Owner: **Melanie Muller (Mela)** | +27 73 406 1526 | info@mannadigitalhub.co.za

## Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + tRPC + Drizzle ORM (MySQL2)
- **AI**: LLM via Forge API (`ENV.forgeApiKey` / `OPENAI_API_KEY`), model `gemini-2.5-flash`
- **Database**: MySQL (Drizzle schema in `drizzle/schema.ts`)
- **Tests**: Vitest (`vitest.config.ts`)

## Key File Map
| File | Purpose |
|------|---------|
| `server/_core/index.ts` | Express app setup, route mounting |
| `server/whatsapp-webhook.ts` | WhatsApp Cloud API webhook (GET verify + POST messages) |
| `server/facebook-webhook.ts` | Facebook Lead Ads webhook (GET verify + POST leads) |
| `server/routers/aiChat.ts` | tRPC AI chat + `MANNA_SYSTEM_PROMPT` (exported for WhatsApp) |
| `server/db.ts` | All Drizzle ORM queries — use these, never raw SQL |
| `drizzle/schema.ts` | DB table definitions — all column names are **camelCase** |
| `server/_core/llm.ts` | `invokeLLM()` — calls Forge API with `gemini-2.5-flash` |
| `server/_core/notification.ts` | `notifyOwner()` — sends owner alerts |

## API Routes
- `GET/POST /api/whatsapp/webhook` — WhatsApp Business Cloud webhook
- `GET/POST /api/facebook/webhook` — Facebook Lead Ads webhook
- `/api/trpc/*` — all tRPC procedures

## Deployment — TrueHost
- **Domain**: https://mannadigitalhub.co.za
- **SSH user**: qsfttpdi
- **SSH command**: `ssh qsfttpdi@mannadigitalhub.co.za`
- **Project path**: `/home/qsfttpdi/manna-agency-hub`
- **Process manager**: PM2 — app name `manna-hub`
- **Webhook URLs**:
  - WhatsApp: `https://mannadigitalhub.co.za/api/whatsapp/webhook`
  - Facebook: `https://mannadigitalhub.co.za/api/facebook/webhook`

## Environment Variables Required
```
DATABASE_URL                   # MySQL connection string
BUILT_IN_FORGE_API_KEY         # LLM API key (Forge/Gemini)
BUILT_IN_FORGE_API_URL         # LLM API base URL (optional if using default)
WHATSAPP_PHONE_NUMBER_ID       # Meta Business Manager phone number ID
WHATSAPP_BUSINESS_ACCOUNT_ID   # Meta Business Account ID
WHATSAPP_ACCESS_TOKEN          # Meta permanent/long-lived access token
WHATSAPP_VERIFY_TOKEN          # manna_webhook_token
FACEBOOK_VERIFY_TOKEN          # manna_fb_verify_token
NODE_ENV                       # production
PORT                           # 3000
```

## IMPORTANT — Removed Platforms
- **Manus** was completely removed — never reference manus.space or forge.manus.im
- All webhooks, URLs and API calls use mannadigitalhub.co.za

## Critical Rules — Avoid These Bugs

### 1. Always use ORM functions from `server/db.ts` — NEVER raw SQL
The schema uses **camelCase** column names (`businessName`, `createdAt`, `conversationSummary`).  
Raw SQL with snake_case (`business_name`, `created_at`) will silently fail or corrupt data.

**Wrong:**
```typescript
await (db as any).execute(
  `INSERT INTO bot_leads (id, business_name, created_at) VALUES (?, ?, ?)`,
  [crypto.randomUUID(), 'Biz', Date.now()]  // UUID string into int id!
);
```

**Correct:**
```typescript
import { createBotLead } from './db';
await createBotLead({
  name: 'Lead Name',
  businessName: 'Biz',
  source: 'whatsapp_bot',
  status: 'new',
});
```

### 2. WhatsApp Cloud API version — use v22.0
Meta deprecates API versions ~2 years after release. v18.0 is deprecated as of 2026.  
Always use `https://graph.facebook.com/v22.0/...` for WhatsApp message sends.

### 3. WhatsApp API host is `graph.facebook.com` — NOT `graph.instagram.com`
Tests and code must use `graph.facebook.com` for all WhatsApp Cloud API calls.

### 4. Facebook Graph API for lead fetching uses v25.0
`fetchLeadFromGraphAPI` in `facebook-webhook.ts` uses `v25.0` — this is intentional and separate from the WhatsApp message API version.

### 5. `botLeads.id` is auto-increment integer
Never pass a `crypto.randomUUID()` as the `id` — leave it out entirely and let MySQL auto-assign.

## Database Schema Summary
| Table | Key Fields |
|-------|-----------|
| `bot_leads` | `id` (auto-int), `name`(required), `businessName`, `phone`, `email`, `language`, `conversationSummary`, `source`(default: website_bot), `status` |
| `facebook_leads` | `id` (auto-int), `leadgenId`(unique), `fullName`, `email`, `phone`, `whatsappFollowUpSent`(int 0/1), `status` |
| `leads` | CRM leads — `name`(required), `businessName`(required), `status`, `source` |

## WhatsApp Message Flow
```
User sends WhatsApp → POST /api/whatsapp/webhook
→ Extract message + senderPhone + phoneNumberId from payload
→ getOrCreateWAConversation(senderPhone) — in-memory, 30min TTL
→ invokeLLM({ messages }) — Forge API / gemini-2.5-flash
→ Parse [LEAD_CAPTURED: name="...", business="..."] tag from response
→ createBotLead() if lead detected and not yet captured
→ sendWhatsAppMessage(phoneNumberId, senderPhone, botResponse)
   — POST https://graph.facebook.com/v22.0/{phoneNumberId}/messages
```

## Facebook Lead Flow
```
User submits FB Lead Form → POST /api/facebook/webhook
→ Check duplicate via getFacebookLeadByLeadgenId(leadgenId)
→ fetchLeadFromGraphAPI(leadgenId) — GET graph.facebook.com/v25.0/{id}
→ parseFieldData(field_data[]) — maps name/email/phone/company etc.
→ createFacebookLead({...}) — saves to facebook_leads table
→ getFacebookLeadByLeadgenId(leadgenId) — get saved id
→ createLead({...}) — auto-sync to CRM leads table (source: facebook_ads)
→ sendWhatsAppFollowUp(phone, name) — POST v22.0/{phoneNumberId}/messages
→ updateFacebookLead(fbLeadId, { whatsappFollowUpSent: 1 })
→ notifyOwner({...}) — alerts Mela about new lead
```

## Phone Number Formatting (SA-centric)
In `facebook-webhook.ts > sendWhatsAppFollowUp`:
- Strips spaces, dashes, parentheses
- `+27...` → removes `+` → `27...`
- `0...` → replaces `0` prefix → `27...`
- Already `27...` → used as-is

## Test Notes
- Tests live in `server/*.test.ts` and `server/routers/*.test.ts`
- Run: `npm test` or `npx vitest`
- WhatsApp endpoint in tests must be `graph.facebook.com`, not `graph.instagram.com`
- Env vars `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_BUSINESS_ACCOUNT_ID` must be set for integration tests to pass

## Known Limitations / Future Work
- Conversation history (`waConversations` Map) is in-memory — lost on server restart; should move to DB/Redis
- Phone country code prefix is hardcoded to South Africa (27) — make configurable for international expansion
- No Meta webhook payload signature verification (`X-Hub-Signature-256`)
- No retry/queue logic for failed WhatsApp sends
