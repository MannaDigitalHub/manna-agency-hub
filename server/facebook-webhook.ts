import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { ENV } from './_core/env';
import { createFacebookLead, getFacebookLeadByLeadgenId, createLead } from './db';
import { notifyOwner } from './_core/notification';

const router = Router();

// ─── Meta HMAC-SHA256 signature verification ─────────────────
function verifyMetaSignature(rawBody: Buffer, signature: string, appSecret: string): boolean {
  if (!appSecret || !signature) return false;
  const [algo, hash] = signature.split('=');
  if (algo !== 'sha256' || !hash) return false;
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// ─── Webhook verification (GET — Meta handshake) ─────────────
router.get('/webhook', (req: Request, res: Response) => {
  const verifyToken = ENV.facebookVerifyToken;
  if (!verifyToken) {
    console.error('[Facebook] FACEBOOK_VERIFY_TOKEN is not set');
    return res.status(500).send('Server misconfigured');
  }

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Facebook] Webhook verified');
    return res.status(200).send(challenge);
  }
  console.warn('[Facebook] Webhook verification failed — token mismatch');
  return res.status(403).send('Forbidden');
});

// ─── Webhook receiver (POST — lead events) ───────────────────
router.post('/webhook', async (req: Request & { rawBody?: Buffer }, res: Response) => {
  // 1. Verify HMAC signature (Meta sends X-Hub-Signature-256 header)
  const signature = req.headers['x-hub-signature-256'] as string;
  const appSecret = ENV.facebookAppSecret;
  if (appSecret && req.rawBody) {
    if (!verifyMetaSignature(req.rawBody, signature, appSecret)) {
      console.warn('[Facebook] Invalid HMAC signature — rejecting webhook');
      return res.status(403).send('Forbidden');
    }
  } else if (!appSecret) {
    console.warn('[Facebook] FACEBOOK_APP_SECRET not set — skipping signature check');
  }

  // 2. Acknowledge immediately (Meta requires < 5s response)
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;
    if (body.object !== 'page') {
      console.warn('[Facebook] Received non-page object:', body.object);
      return;
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field === 'leadgen') {
          await processLeadgenWebhook(change.value);
        }
      }
    }
  } catch (err) {
    console.error('[Facebook] Webhook processing error:', err);
  }
});

// ─── Process a single leadgen event ──────────────────────────
async function processLeadgenWebhook(webhookData: {
  leadgen_id: number | string;
  page_id: number | string;
  form_id: number | string;
  adgroup_id: number | string;
  ad_id: number | string;
  created_time: number;
}): Promise<void> {
  const leadgenId = String(webhookData.leadgen_id);

  // Idempotency: skip if already processed
  const existing = await getFacebookLeadByLeadgenId(leadgenId);
  if (existing) {
    console.log(`[Facebook] Lead ${leadgenId} already processed — skipped`);
    return;
  }

  // Fetch full details from Meta Graph API
  let leadDetails: any = null;
  try {
    leadDetails = await fetchLeadFromGraphAPI(leadgenId);
  } catch (err) {
    console.error(`[Facebook] Failed to fetch lead ${leadgenId} from Graph API:`, err);
  }

  const fieldData = parseFieldData(leadDetails?.field_data ?? []);

  // Persist to facebook_leads
  await createFacebookLead({
    leadgenId,
    formId: String(webhookData.form_id ?? ''),
    adId: String(webhookData.ad_id ?? ''),
    adgroupId: String(webhookData.adgroup_id ?? ''),
    pageId: String(webhookData.page_id ?? ''),
    fullName: fieldData.full_name ?? fieldData.name ?? null,
    email: fieldData.email ?? null,
    phone: fieldData.phone_number ?? fieldData.phone ?? null,
    city: fieldData.city ?? null,
    company: fieldData.company_name ?? fieldData.company ?? null,
    jobTitle: fieldData.job_title ?? null,
    rawFieldData: JSON.stringify(leadDetails?.field_data ?? []),
    status: 'new',
    fbCreatedTime: webhookData.created_time ? new Date(webhookData.created_time * 1000) : undefined,
  });

  // Auto-sync to CRM leads table
  const leadName = fieldData.full_name ?? fieldData.name ?? 'Facebook Lead';
  try {
    await createLead({
      name: leadName,
      email: fieldData.email ?? undefined,
      phone: fieldData.phone_number ?? fieldData.phone ?? undefined,
      businessName: fieldData.company_name ?? fieldData.company ?? 'Unknown',
      businessType: fieldData.job_title ?? undefined,
      location: fieldData.city ?? undefined,
      status: 'prospect',
      source: 'facebook_ads',
      notes: `Auto-captured from Facebook Lead Ad. Form ID: ${webhookData.form_id}. Ad ID: ${webhookData.ad_id}.`,
    });
    console.log(`[Facebook] Lead synced to CRM: ${leadName}`);
  } catch (err) {
    console.error('[Facebook] Error syncing lead to CRM:', err);
  }

  // Auto WhatsApp follow-up
  const phone = fieldData.phone_number ?? fieldData.phone;
  if (phone) {
    try {
      await sendWhatsAppFollowUp(phone, leadName);
    } catch (err) {
      console.error('[Facebook] WhatsApp follow-up failed:', err);
    }
  }

  // Notify owner
  try {
    await notifyOwner({
      title: `🔥 New Facebook Lead: ${leadName}`,
      content: `Name: ${leadName}\nEmail: ${fieldData.email ?? 'N/A'}\nPhone: ${phone ?? 'N/A'}\nCompany: ${fieldData.company_name ?? fieldData.company ?? 'N/A'}`,
    });
  } catch (err) {
    console.error('[Facebook] Owner notification failed:', err);
  }

  console.log(`[Facebook] Lead ${leadgenId} fully processed: ${leadName}`);
}

// ─── Fetch lead details from Meta Graph API ──────────────────
async function fetchLeadFromGraphAPI(leadgenId: string): Promise<any> {
  const accessToken = ENV.whatsappAccessToken; // same token works for Graph API
  if (!accessToken) throw new Error('Meta access token not configured');

  const url = `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${accessToken}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Graph API ${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}

// ─── Parse field_data array ───────────────────────────────────
function parseFieldData(fieldData: Array<{ name: string; values: string[] }>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const f of fieldData) {
    if (f.name && f.values?.length > 0) result[f.name] = f.values[0];
  }
  return result;
}

// ─── Send WhatsApp follow-up message ─────────────────────────
async function sendWhatsAppFollowUp(phoneNumber: string, leadName: string): Promise<void> {
  const accessToken = ENV.whatsappAccessToken;
  const phoneNumberId = ENV.whatsappPhoneNumberId;
  if (!accessToken || !phoneNumberId) {
    console.warn('[Facebook] WhatsApp credentials not configured for follow-up');
    return;
  }

  // Normalise to E.164 without +
  let clean = phoneNumber.replace(/[\s\-()]/g, '');
  if (clean.startsWith('+')) clean = clean.slice(1);
  else if (clean.startsWith('0')) clean = '27' + clean.slice(1);

  const firstName = leadName.split(' ')[0] ?? 'there';
  const message =
    `Hi ${firstName}! 👋\n\n` +
    `Thanks for your interest in Manna Digital Hub!\n\n` +
    `We specialise in AI-powered WhatsApp automation that helps SA businesses respond to every customer 24/7 — even during load-shedding! ⚡\n\n` +
    `Would you like to:\n1️⃣ Book a free discovery call\n2️⃣ See a live demo\n3️⃣ Get a custom quote\n\n` +
    `Reply 1, 2, or 3 and I'll get you sorted! 🚀`;

  const resp = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: clean,
      type: 'text',
      text: { body: message },
    }),
  });

  if (!resp.ok) throw new Error(`WhatsApp API ${resp.status}: ${await resp.text()}`);
}

export default router;
