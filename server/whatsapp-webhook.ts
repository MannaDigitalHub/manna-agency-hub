import { Router, Request, Response } from 'express';
import { createBotLead } from './db';
import { invokeLLM } from './_core/llm';
import { MANNA_SYSTEM_PROMPT } from './routers/aiChat';

const router = Router();

// ─── In-memory WhatsApp conversation store ───────────────────
interface ConversationEntry {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const waConversations = new Map<string, {
  messages: ConversationEntry[];
  lastActivity: number;
  leadCaptured: boolean;
}>();

// Clean up old conversations every 30 minutes
setInterval(() => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  const entries = Array.from(waConversations.entries());
  for (const [phoneNumber, conv] of entries) {
    if (conv.lastActivity < thirtyMinutesAgo) {
      waConversations.delete(phoneNumber);
    }
  }
}, 30 * 60 * 1000);

function getOrCreateWAConversation(phoneNumber: string): ConversationEntry[] {
  let conv = waConversations.get(phoneNumber);
  if (!conv) {
    conv = {
      messages: [{ role: 'system', content: MANNA_SYSTEM_PROMPT }],
      lastActivity: Date.now(),
      leadCaptured: false,
    };
    waConversations.set(phoneNumber, conv);
  }
  conv.lastActivity = Date.now();

  // Keep conversation history manageable
  if (conv.messages.length > 22) {
    conv.messages = [
      conv.messages[0],
      ...conv.messages.slice(-20),
    ];
  }

  return conv.messages;
}

// ─── Webhook verification (GET request from Meta) ────────────
router.get('/webhook', (req: Request, res: Response) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'manna_webhook_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp] Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.warn('[WhatsApp] Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// ─── Webhook receiver (POST from Meta with incoming messages) ─
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Acknowledge receipt immediately (Meta requires 200 within 20 seconds)
    res.status(200).send('EVENT_RECEIVED');

    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        const message = value.messages[0];
        const phoneNumberId = value.metadata?.phone_number_id;
        const senderPhoneNumber = message.from;
        const messageText = message.text?.body || '';

        if (messageText.trim()) {
          await handleIncomingMessage(senderPhoneNumber, messageText, phoneNumberId);
        }
      }
    }
  } catch (error) {
    console.error('[WhatsApp] Webhook error:', error);
  }
});

// ─── Handle incoming WhatsApp message ────────────────────────
async function handleIncomingMessage(
  senderPhoneNumber: string,
  messageText: string,
  phoneNumberId: string
) {
  try {
    console.log(`[WhatsApp] Message from ${senderPhoneNumber}: ${messageText.substring(0, 100)}`);

    // Get conversation history for this phone number
    const messages = getOrCreateWAConversation(senderPhoneNumber);

    // Add user message
    messages.push({ role: 'user', content: messageText });

    // Call LLM with full conversation context
    const response = await invokeLLM({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const rawContent = response.choices?.[0]?.message?.content;
    let botResponse = typeof rawContent === 'string'
      ? rawContent
      : 'Thank you for your message! How can I help your business today? 😊';

    // Extract and save lead data if present
    const leadMatch = botResponse.match(/\[LEAD_CAPTURED:\s*(.+?)\]/);
    if (leadMatch) {
      const leadString = leadMatch[1];
      const leadData: Record<string, string> = {};
      const fields = leadString.match(/(\w+)="([^"]*?)"/g);
      if (fields) {
        for (const field of fields) {
          const [key, value] = field.split('=');
          leadData[key] = value.replace(/"/g, '');
        }
      }

      // Save lead to database
      const conv = waConversations.get(senderPhoneNumber);
      if (conv && !conv.leadCaptured && Object.keys(leadData).length > 0) {
        conv.leadCaptured = true;
        try {
          await createBotLead({
            name: leadData.name || 'WhatsApp Lead',
            businessName: leadData.business || null,
            phone: senderPhoneNumber,
            email: leadData.email || null,
            language: 'auto',
            conversationSummary: `WhatsApp conversation with ${senderPhoneNumber}. Interest: ${leadData.interest || 'General'}`,
            source: 'whatsapp_bot',
            status: 'new',
          });
          console.log(`[WhatsApp] Lead captured: ${leadData.name} from ${senderPhoneNumber}`);
        } catch (err) {
          console.error('[WhatsApp] Error saving lead:', err);
        }
      }

      // Remove lead tag from visible response
      botResponse = botResponse.replace(/\[LEAD_CAPTURED:.*?\]/, '').trim();
    }

    // Add assistant response to conversation history
    messages.push({ role: 'assistant', content: botResponse });

    // Send response back via WhatsApp
    await sendWhatsAppMessage(phoneNumberId, senderPhoneNumber, botResponse);

    console.log(`[WhatsApp] Response sent to ${senderPhoneNumber}`);
  } catch (error) {
    console.error('[WhatsApp] Error handling message:', error);

    // Send fallback message
    try {
      await sendWhatsAppMessage(
        phoneNumberId,
        senderPhoneNumber,
        "Thanks for reaching out! I'm having a brief moment — please try again or WhatsApp Mela directly at +27 73 406 1526 😊"
      );
    } catch (fallbackError) {
      console.error('[WhatsApp] Fallback message also failed:', fallbackError);
    }
  }
}

// ─── Send WhatsApp message via Meta API ──────────────────────
async function sendWhatsAppMessage(
  phoneNumberId: string,
  recipientPhoneNumber: string,
  messageText: string
): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('WhatsApp access token not configured');
  }

  // Use the correct Meta Graph API URL
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: recipientPhoneNumber,
    type: 'text',
    text: {
      body: messageText,
    },
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
    console.error('[WhatsApp] API error:', error);
    throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
  }
}

export default router;
