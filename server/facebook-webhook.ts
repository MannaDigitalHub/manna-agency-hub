import { Router, Request, Response } from 'express';
import { createFacebookLead, getFacebookLeadByLeadgenId, updateFacebookLead, createLead } from './db';
import { notifyOwner } from './_core/notification';

const router = Router();

// ─── Facebook Leadgen Webhook Verification (GET) ───────────
router.get('/webhook', (req: Request, res: Response) => {
  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || 'manna_fb_verify_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Facebook] Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.warn('[Facebook] Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// ─── Facebook Leadgen Webhook Receiver (POST) ──────────────
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Acknowledge immediately (Facebook requires quick response)
    res.status(200).send('EVENT_RECEIVED');

    const body = req.body;

    if (body.object !== 'page') {
      console.warn('[Facebook] Received non-page object:', body.object);
      return;
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const leadData = change.value;
          console.log(`[Facebook] New lead received: leadgen_id=${leadData.leadgen_id}`);
          await processLeadgenWebhook(leadData);
        }
      }
    }
  } catch (error) {
    console.error('[Facebook] Webhook error:', error);
  }
});

// ─── Process a single leadgen webhook event ────────────────
async function processLeadgenWebhook(webhookData: {
  leadgen_id: number | string;
  page_id: number | string;
  form_id: number | string;
  adgroup_id: number | string;
  ad_id: number | string;
  created_time: number;
}) {
  const leadgenId = String(webhookData.leadgen_id);

  // Check if we already processed this lead
  const existing = await getFacebookLeadByLeadgenId(leadgenId);
  if (existing) {
    console.log(`[Facebook] Lead ${leadgenId} already processed, skipping`);
    return;
  }

  // Fetch full lead data from Graph API
  let leadDetails: any = null;
  try {
    leadDetails = await fetchLeadFromGraphAPI(leadgenId);
  } catch (err) {
    console.error(`[Facebook] Failed to fetch lead ${leadgenId} from Graph API:`, err);
  }

  // Parse field data from Graph API response
  const fieldData = parseFieldData(leadDetails?.field_data || []);

  // Store in facebook_leads table
  await createFacebookLead({
    leadgenId,
    formId: String(webhookData.form_id || ''),
    adId: String(webhookData.ad_id || ''),
    adgroupId: String(webhookData.adgroup_id || ''),
    pageId: String(webhookData.page_id || ''),
    fullName: fieldData.full_name || fieldData.name || null,
    email: fieldData.email || null,
    phone: fieldData.phone_number || fieldData.phone || null,
    city: fieldData.city || null,
    company: fieldData.company_name || fieldData.company || null,
    jobTitle: fieldData.job_title || null,
    rawFieldData: JSON.stringify(leadDetails?.field_data || []),
    status: 'new',
    fbCreatedTime: webhookData.created_time ? new Date(webhookData.created_time * 1000) : undefined,
  });

  // Retrieve the saved lead's id for later updates
  const savedLead = await getFacebookLeadByLeadgenId(leadgenId);
  const fbLeadId = savedLead?.id;

  // Auto-sync to CRM leads table
  const leadName = fieldData.full_name || fieldData.name || 'Facebook Lead';
  try {
    await createLead({
      name: leadName,
      email: fieldData.email || undefined,
      phone: fieldData.phone_number || fieldData.phone || undefined,
      businessName: fieldData.company_name || fieldData.company || 'Unknown',
      businessType: fieldData.job_title || undefined,
      location: fieldData.city || undefined,
      status: 'prospect',
      source: 'facebook_ads',
      notes: `Auto-captured from Facebook Lead Ad. Form ID: ${webhookData.form_id}. Ad ID: ${webhookData.ad_id}.`,
    });
    console.log(`[Facebook] Lead synced to CRM: ${leadName}`);
  } catch (err) {
    console.error('[Facebook] Error syncing lead to CRM:', err);
  }

  // Auto-send WhatsApp follow-up if phone number is available
  const phone = fieldData.phone_number || fieldData.phone;
  if (phone) {
    try {
      await sendWhatsAppFollowUp(phone, leadName);
      console.log(`[Facebook] WhatsApp follow-up sent to ${phone}`);
      if (fbLeadId) {
        await updateFacebookLead(fbLeadId, { whatsappFollowUpSent: 1 });
      }
    } catch (err) {
      console.error('[Facebook] WhatsApp follow-up failed:', err);
    }
  }

  // Notify owner about new lead
  try {
    await notifyOwner({
      title: `🔥 New Facebook Lead: ${leadName}`,
      content: `A new lead just came in from Facebook Ads!\n\nName: ${leadName}\nEmail: ${fieldData.email || 'N/A'}\nPhone: ${phone || 'N/A'}\nCompany: ${fieldData.company_name || fieldData.company || 'N/A'}\n\nCheck your Manna Hub dashboard for details.`,
    });
  } catch (err) {
    console.error('[Facebook] Owner notification failed:', err);
  }

  console.log(`[Facebook] Lead ${leadgenId} fully processed: ${leadName}`);
}

// ─── Fetch lead details from Meta Graph API ────────────────
async function fetchLeadFromGraphAPI(leadgenId: string): Promise<any> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN; // Same token works for Graph API

  if (!accessToken) {
    throw new Error('Access token not configured');
  }

  const url = `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${accessToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Graph API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// ─── Parse field_data array from Graph API response ────────
function parseFieldData(fieldData: Array<{ name: string; values: string[] }>): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const field of fieldData) {
    if (field.name && field.values?.length > 0) {
      parsed[field.name] = field.values[0];
    }
  }
  return parsed;
}

// ─── Send WhatsApp follow-up to Facebook lead ──────────────
async function sendWhatsAppFollowUp(phoneNumber: string, leadName: string): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.warn('[Facebook] WhatsApp credentials not configured for follow-up');
    return;
  }

  // Clean phone number (remove spaces, dashes, ensure + prefix)
  let cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
  if (!cleanPhone.startsWith('+')) {
    // Assume South African if no country code
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '27' + cleanPhone.substring(1);
    }
  } else {
    cleanPhone = cleanPhone.substring(1); // Remove + for WhatsApp API
  }

  const firstName = leadName.split(' ')[0] || 'there';

  const message = `Hi ${firstName}! 👋\n\nThank you for your interest in Manna Digital Hub! We noticed you filled out our form on Facebook.\n\nWe specialise in AI-powered WhatsApp automation that helps businesses respond to every customer 24/7 — even during load-shedding! ⚡\n\nWould you like to:\n\n1️⃣ Book a free discovery call\n2️⃣ See a live demo of our AI bot\n3️⃣ Get a custom quote for your business\n\nJust reply with 1, 2, or 3 and I'll get you sorted! 🚀`;

  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: cleanPhone,
    type: 'text',
    text: { body: message },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }
}

export default router;
