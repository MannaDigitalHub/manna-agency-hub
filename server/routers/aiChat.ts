import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { invokeLLM } from '../_core/llm';
import { createBotLead } from '../db';

// ─── Manna Bot System Prompt ─────────────────────────────────
const MANNA_SYSTEM_PROMPT = `You are **Manna Bot**, the AI-powered virtual assistant for **Manna Digital Hub** — a South African AI automation agency that helps businesses stop losing leads, clients, and revenue by automating their customer communication.

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
interface ConversationEntry {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const conversationStore = new Map<string, {
  messages: ConversationEntry[];
  lastActivity: number;
  leadCaptured: boolean;
}>();

// Clean up old conversations every 30 minutes
setInterval(() => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  const entries = Array.from(conversationStore.entries());
  for (const [sessionId, conv] of entries) {
    if (conv.lastActivity < thirtyMinutesAgo) {
      conversationStore.delete(sessionId);
    }
  }
}, 30 * 60 * 1000);

function getOrCreateConversation(sessionId: string): ConversationEntry[] {
  let conv = conversationStore.get(sessionId);
  if (!conv) {
    conv = {
      messages: [{ role: 'system', content: MANNA_SYSTEM_PROMPT }],
      lastActivity: Date.now(),
      leadCaptured: false,
    };
    conversationStore.set(sessionId, conv);
  }
  conv.lastActivity = Date.now();

  // Keep conversation history manageable (system + last 20 messages)
  if (conv.messages.length > 22) {
    conv.messages = [
      conv.messages[0], // system prompt
      ...conv.messages.slice(-20),
    ];
  }

  return conv.messages;
}

// ─── Parse lead data from AI response ────────────────────────
function extractLeadData(response: string): {
  cleanResponse: string;
  leadData: { name?: string; business?: string; phone?: string; email?: string; interest?: string } | null;
} {
  const leadMatch = response.match(/\[LEAD_CAPTURED:\s*(.+?)\]/);
  if (!leadMatch) {
    return { cleanResponse: response, leadData: null };
  }

  const leadString = leadMatch[1];
  const leadData: Record<string, string> = {};

  const fields = leadString.match(/(\w+)="([^"]*?)"/g);
  if (fields) {
    for (const field of fields) {
      const [key, value] = field.split('=');
      leadData[key] = value.replace(/"/g, '');
    }
  }

  // Remove the lead tag from the visible response
  const cleanResponse = response.replace(/\[LEAD_CAPTURED:.*?\]/, '').trim();

  return {
    cleanResponse,
    leadData: Object.keys(leadData).length > 0 ? leadData : null,
  };
}

// ─── Save lead to database ───────────────────────────────────
async function saveLeadToDb(leadData: Record<string, string>, conversationSummary: string) {
  try {
    await createBotLead({
      name: leadData.name || 'Unknown',
      businessName: leadData.business || null,
      phone: leadData.phone || null,
      email: leadData.email || null,
      language: 'en',
      conversationSummary,
      source: 'website_bot',
      status: 'new',
    });
    console.log(`[Manna Bot] Lead captured: ${leadData.name} (${leadData.business || 'N/A'})`);
  } catch (error) {
    console.error('[Manna Bot] Error saving lead:', error);
  }
}

// ─── tRPC Router ─────────────────────────────────────────────
export const aiChatRouter = router({
  /**
   * Send a message to Manna Bot and get an AI response
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        message: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const { sessionId, message } = input;

      // Get or create conversation
      const messages = getOrCreateConversation(sessionId);

      // Add user message
      messages.push({ role: 'user', content: message });

      try {
        // Call LLM
        const response = await invokeLLM({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        });

        const rawContent = response.choices?.[0]?.message?.content;
        const assistantMessage = typeof rawContent === 'string' ? rawContent : 'Thank you for your message. How can I help you today?';

        // Extract lead data if present
        const { cleanResponse, leadData } = extractLeadData(assistantMessage);

        // Add assistant response to conversation history
        messages.push({ role: 'assistant', content: cleanResponse });

        // Save lead if captured
        if (leadData) {
          const conv = conversationStore.get(sessionId);
          if (conv && !conv.leadCaptured) {
            conv.leadCaptured = true;
            const summary = messages
              .filter(m => m.role !== 'system')
              .map(m => `${m.role}: ${m.content}`)
              .join('\n');
            await saveLeadToDb(leadData, summary);
          }
        }

        return {
          success: true,
          message: cleanResponse,
          leadCaptured: !!leadData,
        };
      } catch (error) {
        console.error('[Manna Bot] LLM error:', error);

        // Fallback response
        const fallback = "I'm having a moment — but I'm still here! 😊 Could you try again, or reach out to Mela directly on WhatsApp: +27 73 406 1526";
        messages.push({ role: 'assistant', content: fallback });

        return {
          success: true,
          message: fallback,
          leadCaptured: false,
        };
      }
    }),

  /**
   * Get conversation history for a session
   */
  getHistory: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      const conv = conversationStore.get(input.sessionId);
      if (!conv) return { messages: [] };

      return {
        messages: conv.messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
      };
    }),

  /**
   * Clear conversation history
   */
  clearHistory: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input }) => {
      conversationStore.delete(input.sessionId);
      return { success: true };
    }),
});

// ─── Export system prompt for WhatsApp webhook ───────────────
export { MANNA_SYSTEM_PROMPT };
