/**
 * PayFast subscription form builder
 *
 * Generates a signed PayFast subscription form server-side so the
 * passphrase is never exposed to the browser.
 *
 * Flow:
 *  1. Client calls payment.createSubscriptionForm({ plan })
 *  2. Server returns { action, fields } — a map of hidden input values
 *  3. Client auto-submits a hidden <form> to the PayFast action URL
 *  4. User completes payment on PayFast
 *  5. PayFast posts ITN to /api/payfast/notify (handled in payfast-webhook.ts)
 */

import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { ENV } from '../_core/env';
import { publicProcedure, router } from '../_core/trpc';

const PLANS = {
  starter: { name: 'WhatsApp Starter', amount: 1200 },
  chatbot: { name: 'AI Website Chatbot', amount: 950 },
  social: { name: 'Social Media AI', amount: 2000 },
  complete: { name: 'AI Complete', amount: 2800 },
  fullsuite: { name: 'Full AI Business Suite', amount: 4500 },
} as const;

function buildSignature(params: Record<string, string>, passphrase: string): string {
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

export const paymentRouter = router({
  createSubscriptionForm: publicProcedure
    .input(z.object({ plan: z.enum(['starter', 'chatbot', 'social', 'complete', 'fullsuite']) }))
    .mutation(({ input }) => {
      const plan = PLANS[input.plan];
      const isSandbox = ENV.payfastSandbox;
      const action = isSandbox
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const mPaymentId = `manna-${input.plan}-${nanoid(8)}`;
      const amountStr = plan.amount.toFixed(2);

      const fields: Record<string, string> = {
        merchant_id: ENV.payfastMerchantId,
        merchant_key: ENV.payfastMerchantKey,
        return_url: `${ENV.siteUrl}/payment/success`,
        cancel_url: `${ENV.siteUrl}/#pricing`,
        notify_url: `${ENV.siteUrl}/api/payfast/notify`,
        m_payment_id: mPaymentId,
        amount: amountStr,
        item_name: plan.name,
        subscription_type: '1',
        billing_date: today,
        recurring_amount: amountStr,
        frequency: '3',
        cycles: '0',
      };

      fields.signature = buildSignature(fields, ENV.payfastPassphrase);

      return { action, fields };
    }),
});
