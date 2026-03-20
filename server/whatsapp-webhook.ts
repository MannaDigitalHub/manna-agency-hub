import { Router, Request, Response } from 'express';
import { getDb } from './db';
import { leads } from '../drizzle/schema';
import { invokeLLM } from './_core/llm';

const router = Router();

// Webhook verification (GET request from Meta)
router.get('/webhook', (req: Request, res: Response) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'manna_webhook_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Webhook receiver (POST request from Meta with incoming messages)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Acknowledge receipt immediately
    res.status(200).send('EVENT_RECEIVED');

    // Check if this is a message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        const message = value.messages[0];
        const phoneNumberId = value.metadata?.phone_number_id;
        const senderPhoneNumber = message.from;
        const messageText = message.text?.body || '';

        // Process the message
        await handleIncomingMessage(
          senderPhoneNumber,
          messageText,
          phoneNumberId
        );
      }
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function handleIncomingMessage(
  senderPhoneNumber: string,
  messageText: string,
  phoneNumberId: string
) {
  try {
    // Detect language or use default
    const language = detectLanguage(messageText);

    // Get bot response using LLM
    const botResponse = await generateBotResponse(messageText, language);

    // Save lead if it's a consultation request
    if (isConsultationRequest(messageText)) {
      const db = await getDb();
      if (db) {
        await db.insert(leads).values({
          name: 'WhatsApp Lead',
          businessName: 'Pending',
          phone: senderPhoneNumber,
          status: 'prospect',
          painPoint: messageText,
          source: 'whatsapp',
        });
      }
    }

    // Send response back via WhatsApp
    await sendWhatsAppMessage(phoneNumberId, senderPhoneNumber, botResponse);
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();

  // Simple language detection based on keywords
  if (lowerText.includes('hola') || lowerText.includes('español')) return 'es';
  if (lowerText.includes('bonjour') || lowerText.includes('français')) return 'fr';
  if (lowerText.includes('hallo') || lowerText.includes('deutsch')) return 'de';
  if (lowerText.includes('ciao') || lowerText.includes('italiano')) return 'it';
  if (lowerText.includes('olá') || lowerText.includes('português')) return 'pt';
  if (lowerText.includes('hej') || lowerText.includes('svenska')) return 'sv';
  if (lowerText.includes('hallo') || lowerText.includes('afrikaans')) return 'af';
  if (lowerText.includes('sawubona') || lowerText.includes('xhosa')) return 'xh';
  if (lowerText.includes('sawubona') || lowerText.includes('zulu')) return 'zu';

  return 'en'; // Default to English
}

async function generateBotResponse(
  userMessage: string,
  language: string
): Promise<string> {
  const systemPrompt = `You are Manna Bot, an AI assistant for Manna Digital Hub - an AI automation agency. 
Your role is to help businesses that are losing sales because they can't answer phones or WhatsApp messages.
You provide next-level automation solutions.

Respond in ${language} language.
Keep responses concise (1-2 sentences max).
Be helpful and professional.`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    return content;
  }
  return 'Thank you for your message. How can we help?';
}

function isConsultationRequest(text: string): boolean {
  const consultationKeywords = [
    'consultation',
    'consult',
    'free',
    'book',
    'help',
    'need',
    'interested',
    'info',
    'information',
    'quote',
  ];

  const lowerText = text.toLowerCase();
  return consultationKeywords.some((keyword) => lowerText.includes(keyword));
}

async function sendWhatsAppMessage(
  phoneNumberId: string,
  recipientPhoneNumber: string,
  messageText: string
): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('WhatsApp access token not configured');
  }

  const url = `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`;

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
    const error = await response.json();
    console.error('WhatsApp API error:', error);
    throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
  }
}

export default router;
