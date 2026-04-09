/**
 * Environment configuration — all env vars centralised here.
 * Call requireEnv() for secrets that must be present at startup.
 * Use the soft ?? "" form for optional/legacy vars so tests can run without them.
 */
export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    // In production this is a hard crash so the process never starts misconfigured.
    // In test/dev the empty string is acceptable (callers guard against it).
    if (process.env.NODE_ENV === "production") {
      throw new Error(`[ENV] Missing required environment variable: ${key}`);
    }
    return "";
  }
  return val;
}

export const ENV = {
  // ── Manus platform ──────────────────────────────────────────
  appId: process.env.VITE_APP_ID ?? process.env.APP_ID ?? "manna-hub",
  cookieSecret: process.env.JWT_SECRET ?? "",
  // ── Admin credentials ───────────────────────────────────────
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  siteUrl: process.env.SITE_URL ?? "https://mannadigitalhub.co.za",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Manus Forge API (Gemini proxy — kept for non-bot LLM tasks)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // ── Anthropic Claude (MannaBot) ─────────────────────────────
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",

  // ── PayFast ─────────────────────────────────────────────────
  payfastMerchantId: process.env.PAYFAST_MERCHANT_ID ?? "34228175",
  payfastMerchantKey: process.env.PAYFAST_MERCHANT_KEY ?? "",
  payfastPassphrase: process.env.PAYFAST_PASSPHRASE ?? "",
  payfastSandbox: process.env.PAYFAST_SANDBOX === "true",

  // ── Vapi.ai (Voice AI) ───────────────────────────────────────
  vapiApiKey: process.env.VAPI_API_KEY ?? "",

  // ── Meta (WhatsApp + Facebook) ──────────────────────────────
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
  facebookVerifyToken: process.env.FACEBOOK_VERIFY_TOKEN ?? "",
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET ?? "",

  // ── Email (Zoho SMTP) ────────────────────────────────────────
  smtpHost: process.env.SMTP_HOST ?? "smtp.zoho.com",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "465"),
  smtpUser: process.env.SMTP_USER ?? "support@mannadigitalhub.co.za",
  smtpPass: process.env.SMTP_PASS ?? "",
};
