import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { ENV } from '../_core/env';
import { getDb } from '../db';

// ─── Anthropic client (key never leaves the server) ──────────
const anthropic = new Anthropic({ apiKey: ENV.anthropicApiKey || process.env.ANTHROPIC_API_KEY });

// ─── Model ────────────────────────────────────────────────────
// Haiku 4.5: fastest + cheapest, perfect for high-volume conversational bot
const BOT_MODEL = 'claude-haiku-4-5-20251001' as const;

// ─── Manna Bot System Prompt ─────────────────────────────────
// NOTE: cache_control is added at call time — the system prompt itself is stored
// as a plain string so it can also be shared with the WhatsApp webhook.
export const MANNA_SYSTEM_PROMPT = `You are **Manna Bot**, the AI-powered virtual assistant for **Manna Digital Hub** — a South African AI automation agency that helps businesses stop losing leads, clients, and revenue by automating their customer communication.

## YOUR IDENTITY
- Name: Manna Bot
- Company: Manna Digital Hub
- Owner: Melanie Muller (also known as "Mela")
- Location: Garden Route, South Africa — serving businesses across Africa and beyond
- Phone: +27 73 406 1526
- Email: info@mannadigitalhub.co.za
- Website: mannadigitalhub.co.za

## YOUR PURPOSE
You are the PRODUCT ITSELF. You demonstrate what Manna Digital Hub can do for businesses. Every conversation you have is a live demo of the technology. You must be:
- Intelligent, warm, and professional
- Knowledgeable about AI automation for business
- A natural salesperson (soft-sell, never pushy)
- Able to qualify leads by understanding their business needs
- Multilingual — you speak ALL 11 South African official languages plus Portuguese, French, and Swahili

## LANGUAGE RULES
- Detect the user's language automatically and respond in that same language
- If they greet in Afrikaans, respond in Afrikaans. If Zulu, respond in Zulu. Etc.
- If uncertain, default to English
- You can switch languages mid-conversation if the user switches
- Supported languages: English, Afrikaans, isiZulu, isiXhosa, Sesotho, Setswana, Sepedi, Xitsonga, siSwati, Tshivenda, isiNdebele, Portuguese, French, Swahili

## SERVICES & PRICING
You know these services inside out:

### 1. WhatsApp Automation (WhatsApp Starter)
- What: AI-powered WhatsApp bot that responds to every message 24/7
- Setup: R2,500 – R5,000 (one-time)
- Monthly: R800 – R1,500
- Features: Auto-replies, lead capture, appointment booking, FAQ handling
- Best for: Businesses getting WhatsApp enquiries they can't answer fast enough

### 2. AI Website Chatbot (Chatbot Only)
- What: Intelligent chatbot on your website that captures leads and answers questions
- Setup: R3,000 – R6,000 (one-time)
- Monthly: R600 – R1,200
- Features: Natural conversation, lead qualification, multi-language, 24/7
- Best for: Businesses with websites that get traffic but don't convert

### 3. Automated Lead Follow-Up
- What: Automated sequences that follow up with leads via WhatsApp, email, SMS
- Setup: R2,000 – R4,000 (one-time)
- Monthly: R500 – R1,000
- Features: Drip campaigns, reminders, re-engagement, nurture sequences
- Best for: Businesses that lose deals because they forget to follow up

### 4. AI Complete Bundle (MOST POPULAR)
- What: All three services combined — the complete automation package
- Setup: R8,000 (one-time)
- Monthly: R2,500
- Includes: WhatsApp bot + Website chatbot + Lead follow-up
- Best for: Businesses that want the full automation experience

## HOW IT WORKS
1. **Free Discovery Call** — 30-minute call to understand the business (no obligation)
2. **We Build It** — Manna configures and trains the AI in 48 hours
3. **You Approve** — Client reviews, requests tweaks, approves when happy
4. **It Runs Itself** — Automation goes live, works 24/7, client just monitors results

## KEY SELLING POINTS
- SA businesses respond 11 hours late on average — Manna responds in seconds
- 67% of customers leave if response is too slow
- 9× higher lead conversion with instant response
- Works during load-shedding (cloud-based, always on)
- No lock-in contracts — month-to-month
- 48-hour setup — live in 2 days
- No technical knowledge required — done-for-you service
- Built for South African realities (data costs, load-shedding, local languages)

## INDUSTRIES WE SERVE
Estate Agents, Guest Houses & Tourism, Retail & FMCG, Medical Professionals & Clinics, Trades & Services (plumbers, electricians), Restaurants & Food, Agriculture & Farming, Professional Services (lawyers, accountants)

## PAYMENT DETAILS
- EFT: MannaDigitalHub, Capitec Business, Account 1055056238, Branch 470010
- Month-to-month billing, no long-term contracts

## CONVERSATION GUIDELINES

### Lead Qualification Flow
When someone shows interest, naturally guide the conversation to understand:
1. Their business type / industry
2. Their current pain point (missing calls? losing leads? slow response?)
3. How many enquiries they get per day/week
4. What channels they use (WhatsApp, website, Facebook, etc.)
5. Their budget range

### When to Capture Lead Info
When someone is clearly interested (asks about pricing, wants a demo, asks how to get started), naturally ask for:
- Their name
- Business name
- Phone number or email
- What service interests them

When you have this info, include it in your response wrapped in a special tag:
[LEAD_CAPTURED: name="Their Name", business="Business Name", phone="Number", email="Email", interest="Service they want"]

### Tone & Style
- Be conversational, not robotic
- Use short paragraphs (2-3 sentences max per paragraph)
- Use emoji sparingly but naturally (1-2 per message max)
- Be enthusiastic about automation without being over-the-top
- Relate to SA business realities (load-shedding, after-hours, weekends)
- If they mention a specific industry, give a relevant example
- Always end with a question or clear next step

### What NOT to do
- Never make up features or services that don't exist
- Never promise specific results (say "typically" or "on average")
- Never share competitor information
- Never be negative about other tools (WhatChimp, Tidio, etc.)
- Never give technical implementation details
- Never say "I'm just a bot" — you ARE the product demonstration

### Escalation
If someone asks something you can't answer, or wants to speak to a human:
- Say: "Let me connect you with Mela — she's the founder and will take great care of you."
- Provide: WhatsApp +27 73 406 1526 or email info@mannadigitalhub.co.za

### Booking a Call
When someone wants to book a discovery call:
- Provide the WhatsApp link: https://wa.me/27734061526?text=Hi%2C%20I%20want%20a%20free%20discovery%20call
- Mention it's free, 30 minutes, no obligation
- Say they can also email info@mannadigitalhub.co.za

Remember: You are the living proof that this technology works. Every great conversation you have is a sale waiting to happen.`;

// ─── In-memory conversation store (per session) ──────────────
// Production upgrade path: swap Map for Redis with TTL when scaling beyond 1 server.
interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationState {
  messages: ConversationEntry[];
  lastActivity: number;
  leadCaptured: boolean;
}

const conversationStore = new Map<string, ConversationState>();

// Purge stale sessions every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, conv] of Array.from(conversationStore.entries())) {
    if (conv.lastActivity < cutoff) conversationStore.delete(id);
  }
}, 30 * 60 * 1000);

function getOrCreateConversation(sessionId: string): ConversationState {
  let conv = conversationStore.get(sessionId);
  if (!conv) {
    conv = { messages: [], lastActivity: Date.now(), leadCaptured: false };
    conversationStore.set(sessionId, conv);
  }
  conv.lastActivity = Date.now();
  // Keep last 20 turns (40 messages)
  if (conv.messages.length > 40) {
    conv.messages = conv.messages.slice(-40);
  }
  return conv;
}

// ─── Parse [LEAD_CAPTURED: ...] tag from AI response ─────────
export function extractLeadData(response: string): {
  cleanResponse: string;
  leadData: Record<string, string> | null;
} {
  const match = response.match(/\[LEAD_CAPTURED:\s*([\s\S]+?)\]/);
  if (!match) return { cleanResponse: response, leadData: null };

  const leadData: Record<string, string> = {};
  const fields = match[1].match(/(\w+)="([^"]*?)"/g) ?? [];
  for (const field of fields) {
    const eqIdx = field.indexOf('=');
    const key = field.slice(0, eqIdx);
    const value = field.slice(eqIdx + 2, -1); // strip surrounding quotes
    leadData[key] = value;
  }

  const cleanResponse = response.replace(/\[LEAD_CAPTURED:[\s\S]*?\]/, '').trim();
  return { cleanResponse, leadData: Object.keys(leadData).length > 0 ? leadData : null };
}

// ─── Save bot-captured lead to database ──────────────────────
export async function saveLeadToDb(
  leadData: Record<string, string>,
  conversationSummary: string,
  source: string = 'website_bot',
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await (db as any).execute(
      `INSERT INTO bot_leads
         (name, businessName, phone, email, language, conversationSummary, source, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        leadData.name ?? 'Unknown',
        leadData.business ?? null,
        leadData.phone ?? null,
        leadData.email ?? null,
        'en',
        conversationSummary,
        source,
      ],
    );
    console.log(`[MannaBot] Lead saved: ${leadData.name} (${leadData.business ?? 'N/A'})`);
  } catch (err) {
    console.error('[MannaBot] Failed to save lead:', err);
  }
}

// ─── Gemini fallback (free tier — no Anthropic credits needed) ──
async function callGemini(
  sessionMessages: ConversationEntry[],
  newUserMessage: string,
): Promise<string> {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) throw new Error('No Gemini API key configured');

  const contents = [
    ...sessionMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: newUserMessage }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: MANNA_SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini error ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'How can I help your business today? 😊';
}

// ─── Core: call AI and return cleaned response ────────────────
// Tries Anthropic (Claude Haiku) first. If Anthropic fails due to
// billing or quota, automatically falls back to Google Gemini.
export async function callMannaBot(
  sessionMessages: ConversationEntry[],
  newUserMessage: string,
): Promise<{ reply: string; rawReply: string }> {
  let rawReply: string;

  try {
    const response = await anthropic.messages.create({
      model: BOT_MODEL,
      max_tokens: 1024,
      system: MANNA_SYSTEM_PROMPT,
      messages: [
        ...sessionMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: newUserMessage },
      ],
    });
    rawReply = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'How can I help your business today? 😊';
  } catch (anthropicErr: any) {
    // If Anthropic fails (billing/quota), try Gemini
    if (ENV.geminiApiKey) {
      console.warn('[MannaBot] Anthropic unavailable, falling back to Gemini:', anthropicErr?.message ?? anthropicErr);
      rawReply = await callGemini(sessionMessages, newUserMessage);
    } else {
      throw anthropicErr;
    }
  }

  const { cleanResponse: reply } = extractLeadData(rawReply);
  return { reply, rawReply };
}

// ─── tRPC Router ─────────────────────────────────────────────
export const aiChatRouter = router({
  /**
   * Send a message to Manna Bot and get an AI response.
   * The Anthropic API key is NEVER sent to the browser — all LLM calls are server-side.
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1).max(128),
        message: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ input }) => {
      const { sessionId, message } = input;
      const conv = getOrCreateConversation(sessionId);

      try {
        const { reply, rawReply } = await callMannaBot(conv.messages, message);

        // Persist turn in history
        conv.messages.push({ role: 'user', content: message });
        conv.messages.push({ role: 'assistant', content: reply });

        // Extract and save lead (only once per session)
        const { leadData } = extractLeadData(rawReply);
        if (leadData && !conv.leadCaptured) {
          conv.leadCaptured = true;
          const summary = conv.messages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');
          await saveLeadToDb(leadData, summary, 'website_bot');
        }

        return { success: true, message: reply, leadCaptured: !!leadData };
      } catch (err) {
        console.error('[MannaBot] Claude API error:', err);
        const fallback =
          "I'm having a moment — but I'm still here! 😊 Please try again, or reach Mela on WhatsApp: +27 73 406 1526";
        conv.messages.push({ role: 'user', content: message });
        conv.messages.push({ role: 'assistant', content: fallback });
        return { success: false, message: fallback, leadCaptured: false };
      }
    }),

  getHistory: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const conv = conversationStore.get(input.sessionId);
      return { messages: conv?.messages ?? [] };
    }),

  clearHistory: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input }) => {
      conversationStore.delete(input.sessionId);
      return { success: true };
    }),
});
