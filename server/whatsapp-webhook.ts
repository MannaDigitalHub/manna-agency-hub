import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { ENV } from './_core/env';
import { callMannaBot, extractLeadData, saveLeadToDb, MANNA_SYSTEM_PROMPT } from './routers/aiChat';

const router = Router();

// ─── In-memory WhatsApp conversation store ───────────────────
// Keyed by sender phone number. Production: swap for Redis.
interface WaConvEntry {
  role: 'user' | 'assistant';
  content: string;
}
interface WaConvState {
  messages: WaConvEntry[];
  lastActivity: number;
  leadCaptured: boolean;
}

const waConversations = new Map<string, WaConvState>();

setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24-hour window for WA
  for (const [phone, conv] of Array.from(waConversations.entries())) {
    if (conv.lastActivity < cutoff) waConversations.delete(phone);
  }
}, 30 * 60 * 1000);

function getOrCreateWAConv(phone: string): WaConvState {
  let conv = waConversations.get(phone);
  if (!conv) {
    conv = { messages: [], lastActivity: Date.now(), leadCaptured: false };
    waConversations.set(phone, conv);
  }
  conv.lastActivity = Date.now();
  if (conv.messages.length > 40) conv.messages = conv.messages.slice(-40);
  return conv;
}

// ─── Meta webhook signature verification ─────────────────────
function verifyMetaSignature(rawBody: Buffer, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const [algo, hash] = signature.split('=');
  if (algo !== 'sha256' || !hash) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// ─── Webhook verification (GET — Meta handshake) ─────────────
router.get('/webhook', (req: Request, res: Response) => {
  const verifyToken = ENV.whatsappVerifyToken;
  if (!verifyToken) {
    console.error('[WhatsApp] WHATSAPP_VERIFY_TOKEN is not set');
    return res.status(500).send('Server misconfigured');
  }

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp] Webhook verified');
    return res.status(200).send(challenge);
  }
  console.warn('[WhatsApp] Webhook verification failed — token mismatch');
  return res.status(403).send('Forbidden');
});

// ─── Webhook receiver (POST — incoming messages) ─────────────
router.post('/webhook', async (req: Request & { rawBody?: Buffer }, res: Response) => {
  // 1. Verify Meta HMAC signature
  const signature = req.headers['x-hub-signature-256'] as string;
  const appSecret = ENV.facebookAppSecret; // WhatsApp and FB share the same app secret
  if (appSecret && req.rawBody) {
    if (!verifyMetaSignature(req.rawBody, signature, appSecret)) {
      console.warn('[WhatsApp] Invalid HMAC signature — rejecting webhook');
      return res.status(403).send('Forbidden');
    }
  }

  // 2. Acknowledge immediately (Meta requires < 20s)
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) return;

    const msg = value.messages[0];
    const phoneNumberId: string = value.metadata?.phone_number_id ?? '';
    const senderPhone: string = msg.from ?? '';
    const messageId: string = msg.id ?? '';
    const text: string = msg.text?.body ?? '';

    if (!text.trim()) return;

    // Deduplicate by message ID (simple in-memory set — Redis in production)
    if (processedMessageIds.has(messageId)) {
      console.log(`[WhatsApp] Duplicate message ${messageId} — skipped`);
      return;
    }
    processedMessageIds.add(messageId);
    setTimeout(() => processedMessageIds.delete(messageId), 24 * 60 * 60 * 1000);

    await handleIncomingMessage(senderPhone, text, phoneNumberId);
  } catch (err) {
    console.error('[WhatsApp] Webhook processing error:', err);
  }
});

// Simple in-memory dedup set (replace with Redis SETNX in production)
const processedMessageIds = new Set<string>();

// ─── Handle one incoming WhatsApp message ────────────────────
async function handleIncomingMessage(
  senderPhone: string,
  text: string,
  phoneNumberId: string,
): Promise<void> {
  console.log(`[WhatsApp] From ${senderPhone}: ${text.substring(0, 80)}`);

  const conv = getOrCreateWAConv(senderPhone);

  try {
    const { reply, rawReply } = await callMannaBot(conv.messages, text);

    // Persist turn
    conv.messages.push({ role: 'user', content: text });
    conv.messages.push({ role: 'assistant', content: reply });

    // Capture lead (once per number)
    const { leadData } = extractLeadData(rawReply);
    if (leadData && !conv.leadCaptured) {
      conv.leadCaptured = true;
      const summary = `WhatsApp conversation with ${senderPhone}. Interest: ${leadData.interest ?? 'General'}`;
      // Override phone with the actual WA sender number
      leadData.phone = senderPhone;
      await saveLeadToDb(leadData, summary, 'whatsapp');
    }

    await sendWhatsAppMessage(phoneNumberId, senderPhone, reply);
    console.log(`[WhatsApp] Reply sent to ${senderPhone}`);
  } catch (err) {
    console.error(`[WhatsApp] Error handling message from ${senderPhone}:`, err);
    try {
      await sendWhatsAppMessage(
        phoneNumberId,
        senderPhone,
        "Thanks for reaching out! I'm having a brief moment — please try again or WhatsApp Mela: +27 73 406 1526 😊",
      );
    } catch { /* fallback failed — already logged */ }
  }
}

// ─── Send a WhatsApp text message via Meta Graph API ─────────
async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  body: string,
): Promise<void> {
  const token = ENV.whatsappAccessToken;
  if (!token) throw new Error('[WhatsApp] WHATSAPP_ACCESS_TOKEN not set');

  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Meta API ${resp.status}: ${err}`);
  }
}

export default router;
