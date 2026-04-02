/**
 * PayFast ITN (Instant Transaction Notification) handler
 *
 * Security checklist (all three must pass before any business logic runs):
 *  1. IP whitelist  — only PayFast's published server IPs accepted
 *  2. Signature     — MD5 of sorted param string + passphrase (constant-time compare)
 *  3. Amount guard  — amount must match the plan price to prevent undercharge fraud
 *
 * Idempotency: every ITN is stored in the payments table by payfastPaymentId.
 * A duplicate ITN is silently acknowledged (200) without reprocessing.
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { ENV } from './_core/env';
import { createPaymentIfNew, updateClientPaymentStatus } from './db';
import { notifyOwner } from './_core/notification';

const router = Router();

// ─── PayFast published sender IPs ────────────────────────────
const PAYFAST_IPS = new Set([
  '41.74.179.194',
  '41.74.179.196',
  '41.74.179.197',
  '41.74.179.198',
  '41.74.179.199',
  '197.97.145.144',
  '197.97.145.145',
  '197.97.145.146',
  // Sandbox IPs (only active when PAYFAST_SANDBOX=true)
  '127.0.0.1',
  '::1',
]);

// ─── Plan amount map (ITN item_name → expected gross amount in ZAR) ──────────
const PLAN_AMOUNTS: Record<string, number> = {
  'WhatsApp Starter': 800,
  'AI Complete Bundle': 2500,
  'AI Chatbot Only': 1200,
  'Social Media Manager': 1500,
};

// ─── Build the PayFast signature ─────────────────────────────
function buildSignature(params: Record<string, string>, passphrase: string): string {
  // Sort keys alphabetically, URL-encode values (PayFast spec)
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys
    .filter(k => k !== 'signature' && params[k] !== '')
    .map(k => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
    .join('&');

  const withPassphrase = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : queryString;

  return crypto.createHash('md5').update(withPassphrase).digest('hex');
}

// ─── ITN endpoint ─────────────────────────────────────────────
router.post('/notify', async (req: Request, res: Response) => {
  // PayFast requires HTTP 200 within 5 seconds — send it first, process async.
  res.status(200).send('OK');

  try {
    await processItn(req);
  } catch (err) {
    console.error('[PayFast] ITN processing error:', err);
  }
});

async function processItn(req: Request): Promise<void> {
  const params = req.body as Record<string, string>;

  // ── 1. IP whitelist ──────────────────────────────────────────
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';

  if (!ENV.payfastSandbox && !PAYFAST_IPS.has(clientIp)) {
    console.warn(`[PayFast] ITN from unlisted IP ${clientIp} — rejected`);
    return;
  }

  // ── 2. Signature verification ────────────────────────────────
  const receivedSig = params.signature ?? '';
  const expectedSig = buildSignature(params, ENV.payfastPassphrase);

  let sigValid = false;
  try {
    sigValid = crypto.timingSafeEqual(
      Buffer.from(expectedSig, 'hex'),
      Buffer.from(receivedSig, 'hex'),
    );
  } catch {
    sigValid = false;
  }

  if (!sigValid) {
    console.warn('[PayFast] ITN signature mismatch — rejected');
    console.warn('[PayFast] Expected:', expectedSig, '| Received:', receivedSig);
    return;
  }

  // ── 3. Amount guard ──────────────────────────────────────────
  const itemName = params.item_name ?? '';
  const receivedAmount = parseFloat(params.amount_gross ?? '0');
  const expectedAmount = PLAN_AMOUNTS[itemName];

  if (expectedAmount === undefined) {
    console.warn(`[PayFast] Unknown plan item_name: "${itemName}" — rejected`);
    return;
  }
  if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
    console.warn(
      `[PayFast] Amount mismatch for "${itemName}": expected R${expectedAmount}, got R${receivedAmount} — rejected`,
    );
    await notifyOwner({
      title: '⚠️ PayFast Amount Mismatch',
      content: `item_name: ${itemName}\nExpected: R${expectedAmount}\nReceived: R${receivedAmount}\npf_payment_id: ${params.pf_payment_id}`,
    });
    return;
  }

  // ── 4. Idempotency — skip if already processed ───────────────
  const payfastPaymentId = params.pf_payment_id ?? '';
  const isNew = await createPaymentIfNew({
    payfastPaymentId,
    amount: receivedAmount,
    itemName,
    paymentStatus: params.payment_status ?? 'UNKNOWN',
    signatureValid: sigValid ? 1 : 0,
    rawItn: JSON.stringify(params),
    merchantPaymentId: params.m_payment_id ?? null,
  });

  if (!isNew) {
    console.log(`[PayFast] Duplicate ITN for ${payfastPaymentId} — skipped`);
    return;
  }

  // ── 5. Handle payment status ─────────────────────────────────
  const paymentStatus = params.payment_status;
  const merchantPaymentId = params.m_payment_id ?? '';

  if (paymentStatus === 'COMPLETE') {
    console.log(`[PayFast] ✅ Payment COMPLETE: ${payfastPaymentId} | ${itemName} | R${receivedAmount}`);

    // Update client payment status if merchant payment ID maps to a client
    if (merchantPaymentId) {
      try {
        await updateClientPaymentStatus(merchantPaymentId, 'current');
      } catch (err) {
        console.error('[PayFast] Failed to update client status:', err);
      }
    }

    // Notify owner
    await notifyOwner({
      title: `💰 Payment Received: R${receivedAmount}`,
      content:
        `Plan: ${itemName}\n` +
        `Payer: ${params.name_first ?? ''} ${params.name_last ?? ''} (${params.email_address ?? ''})\n` +
        `Payment ID: ${payfastPaymentId}\n` +
        `Merchant ref: ${merchantPaymentId}`,
    });
  } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
    console.warn(`[PayFast] ❌ Payment ${paymentStatus}: ${payfastPaymentId}`);

    if (merchantPaymentId) {
      try {
        await updateClientPaymentStatus(
          merchantPaymentId,
          paymentStatus === 'CANCELLED' ? 'pending' : 'overdue',
        );
      } catch (err) {
        console.error('[PayFast] Failed to update client status after failure:', err);
      }
    }

    await notifyOwner({
      title: `⚠️ Payment ${paymentStatus}: ${itemName}`,
      content:
        `Plan: ${itemName}\n` +
        `Payer: ${params.name_first ?? ''} ${params.name_last ?? ''}\n` +
        `Email: ${params.email_address ?? ''}\n` +
        `Payment ID: ${payfastPaymentId}`,
    });
  } else {
    console.log(`[PayFast] Payment status: ${paymentStatus} (no action)`);
  }
}

export default router;
