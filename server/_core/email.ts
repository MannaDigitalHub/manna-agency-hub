/**
 * Email utility — Zoho SMTP via nodemailer.
 * Gracefully falls back to console logging when SMTP is not configured,
 * so invite links still work manually during early setup.
 */
import nodemailer from "nodemailer";
import { ENV } from "./env";

function getTransport() {
  if (!ENV.smtpPass) return null;
  return nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465,
    auth: { user: ENV.smtpUser, pass: ENV.smtpPass },
  });
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn(`[Email] SMTP not configured — would have sent to ${to}: ${subject}`);
    return;
  }
  await transport.sendMail({ from: `"Manna Digital Hub" <${ENV.smtpUser}>`, to, subject, html });
}

const baseStyle = `font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px`;
const btnStyle = `display:inline-block;background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px`;

export async function sendClientInvite(email: string, name: string, inviteUrl: string): Promise<void> {
  const html = `<div style="${baseStyle}">
    <h2 style="color:#10b981">Welcome to Manna Digital Hub</h2>
    <p>Hi ${name},</p>
    <p>Your client portal is ready. Click below to set your password and access your dashboard.</p>
    <a href="${inviteUrl}" style="${btnStyle}">Set Up My Account</a>
    <p style="margin-top:24px;color:#94a3b8;font-size:13px">This link expires in 48 hours. If you did not expect this email, please ignore it.</p>
    <hr style="border-color:#1e293b;margin:24px 0">
    <p style="color:#64748b;font-size:12px">K2026183802 (SA) (PTY) LTD T/A Manna Digital Hub — POPIA compliant</p>
  </div>`;
  console.log(`[Email] Invite URL for ${email}: ${inviteUrl}`);
  await send(email, "Set up your Manna Digital Hub portal", html);
}

export async function sendPasswordReset(email: string, name: string, resetUrl: string): Promise<void> {
  const html = `<div style="${baseStyle}">
    <h2 style="color:#10b981">Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click below to choose a new one.</p>
    <a href="${resetUrl}" style="${btnStyle}">Reset My Password</a>
    <p style="margin-top:24px;color:#94a3b8;font-size:13px">This link expires in 1 hour. If you did not request a reset, you can safely ignore this email.</p>
  </div>`;
  console.log(`[Email] Reset URL for ${email}: ${resetUrl}`);
  await send(email, "Reset your Manna Digital Hub password", html);
}
