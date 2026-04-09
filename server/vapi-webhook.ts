/**
 * Vapi.ai Voice Webhook
 *
 * Receives events from Vapi voice calls and:
 *  - Logs call start/end with duration
 *  - Extracts lead data from end-of-call transcript
 *  - Saves leads to DB and notifies owner on new enquiries
 *
 * Vapi sends a shared secret header `x-vapi-secret` which should match
 * VAPI_WEBHOOK_SECRET in .env. If unset, signature check is skipped (dev only).
 *
 * Register webhook URL in Vapi dashboard → Settings → Webhooks:
 *   https://mannadigitalhub.co.za/api/vapi/webhook
 */

import { Router, Request, Response } from 'express';
import { ENV } from './_core/env';
import { saveLeadToDb } from './routers/aiChat';
import { notifyOwner } from './_core/notification';

const router = Router();

interface VapiCallPayload {
  type: string;
  call?: {
    id: string;
    status: string;
    startedAt?: string;
    endedAt?: string;
    endedReason?: string;
    customer?: { number?: string; name?: string };
    durationSeconds?: number;
  };
  transcript?: string;
  summary?: string;
  message?: { role: string; content: string };
}

router.post('/webhook', async (req: Request, res: Response) => {
  // Verify Vapi webhook secret if configured
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret) {
    const received = req.headers['x-vapi-secret'];
    if (received !== secret) {
      res.status(401).send('Unauthorized');
      return;
    }
  }

  res.status(200).send('OK');

  try {
    await handleVapiEvent(req.body as VapiCallPayload);
  } catch (err) {
    console.error('[Vapi] Webhook error:', err);
  }
});

async function handleVapiEvent(payload: VapiCallPayload): Promise<void> {
  const { type, call } = payload;
  const callId = call?.id ?? 'unknown';
  const callerNumber = call?.customer?.number ?? 'unknown';
  const callerName = call?.customer?.name ?? '';

  switch (type) {
    case 'call-started':
      console.log(`[Vapi] 📞 Call started | id: ${callId} | from: ${callerNumber}`);
      break;

    case 'call-ended': {
      const duration = call?.durationSeconds ?? 0;
      const reason = call?.endedReason ?? 'unknown';
      console.log(`[Vapi] 📵 Call ended | id: ${callId} | duration: ${duration}s | reason: ${reason}`);

      // Notify owner of every completed call
      await notifyOwner({
        title: `📞 Voice Call Ended — ${callerNumber}`,
        content:
          `Duration: ${duration}s\n` +
          `Reason: ${reason}\n` +
          (callerName ? `Name: ${callerName}\n` : '') +
          (payload.summary ? `\nSummary:\n${payload.summary}` : ''),
      });

      // Save as lead if we have a caller number
      if (callerNumber !== 'unknown') {
        try {
          const leadData: Record<string, string> = {
            name: callerName || `Caller ${callerNumber}`,
            phone: callerNumber,
            email: '',
            business: '',
          };
          const summary = payload.summary ?? `Voice call — ${duration}s`;
          await saveLeadToDb(leadData, summary, 'voice_call');
          console.log(`[Vapi] Lead saved for ${callerNumber}`);
        } catch (err) {
          console.error('[Vapi] Failed to save lead:', err);
        }
      }
      break;
    }

    case 'transcript':
      // Real-time transcript — log only, no action needed
      if (payload.message) {
        console.log(`[Vapi] ${payload.message.role}: ${payload.message.content.slice(0, 100)}`);
      }
      break;

    default:
      console.log(`[Vapi] Unhandled event type: ${type}`);
  }
}

export default router;
