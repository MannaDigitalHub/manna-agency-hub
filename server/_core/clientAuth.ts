/**
 * Client portal authentication utilities.
 * Handles password hashing, JWT session tokens, and account lockout.
 * Separate from admin auth (sdk.ts) — different cookie, shorter expiry, different payload.
 */
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import type { Request } from "express";
import { CLIENT_COOKIE_NAME, THIRTY_DAYS_MS } from "@shared/const";
import { ENV } from "./env";

// ─── Constants ────────────────────────────────────────────────
export const BCRYPT_ROUNDS = 12;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
export const INVITE_TTL_MS = 48 * 60 * 60 * 1000;  // 48 hours
export const RESET_TTL_MS = 60 * 60 * 1000;         // 1 hour

// ─── Password ─────────────────────────────────────────────────
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]).{10,}$/;

export function validatePassword(password: string): { ok: boolean; message?: string } {
  if (password.length < 10) return { ok: false, message: "Minimum 10 characters" };
  if (!/[A-Z]/.test(password)) return { ok: false, message: "Must include an uppercase letter" };
  if (!/[a-z]/.test(password)) return { ok: false, message: "Must include a lowercase letter" };
  if (!/\d/.test(password)) return { ok: false, message: "Must include a number" };
  if (!/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password)) return { ok: false, message: "Must include a special character" };
  return { ok: true };
}

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

// ─── Secure tokens (invites, password resets) ─────────────────
export const generateToken = () => crypto.randomBytes(32).toString("hex"); // 64-char hex

// ─── Client JWT session ───────────────────────────────────────
export type ClientSessionPayload = {
  clientId: number;
  email: string;
  businessName: string;
};

function getSecret() {
  return new TextEncoder().encode(ENV.cookieSecret || "fallback-dev-secret-change-in-prod");
}

export async function createClientSession(payload: ClientSessionPayload): Promise<string> {
  const expiresAt = Math.floor((Date.now() + THIRTY_DAYS_MS) / 1000);
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(getSecret());
}

export async function verifyClientSession(token: string): Promise<ClientSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const { clientId, email, businessName } = payload as Record<string, unknown>;
    if (typeof clientId !== "number" || typeof email !== "string" || typeof businessName !== "string") return null;
    return { clientId, email, businessName };
  } catch {
    return null;
  }
}

export function getClientTokenFromRequest(req: Request): string | undefined {
  const cookies = parseCookies(req.headers.cookie ?? "");
  return cookies[CLIENT_COOKIE_NAME];
}
