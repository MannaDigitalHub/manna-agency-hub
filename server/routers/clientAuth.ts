/**
 * Client portal authentication.
 * Security: bcrypt passwords, account lockout, single-use tokens, POPIA consent.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { CLIENT_COOKIE_NAME, PRIVACY_POLICY_VERSION, THIRTY_DAYS_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import {
  createClientSession, hashPassword, verifyPassword, validatePassword,
  generateToken, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS, INVITE_TTL_MS, RESET_TTL_MS,
} from "../_core/clientAuth";
import { ENV } from "../_core/env";
import { sendClientInvite, sendPasswordReset } from "../_core/email";
import { adminProcedure, clientProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { auditLog, clients } from "../../drizzle/schema";

// ─── Helpers ──────────────────────────────────────────────────
function getIp(req: any): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "unknown";
}

async function writeAudit(clientId: number | null, eventType: string, req: any, meta?: object) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values({
    eventType,
    clientId: clientId ?? undefined,
    ipAddress: getIp(req),
    userAgent: (req.headers["user-agent"] as string ?? "").slice(0, 512),
    metadata: meta ? JSON.stringify(meta) : null,
  }).catch(() => {}); // never throw — audit must not break the main flow
}

async function findClientByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(clients).where(eq(clients.contactEmail, email)).limit(1);
  return rows[0] ?? null;
}

async function findClientByToken(field: "inviteToken" | "passwordResetToken", token: string) {
  const db = await getDb();
  if (!db) return null;
  const col = field === "inviteToken" ? clients.inviteToken : clients.passwordResetToken;
  const rows = await db.select().from(clients).where(eq(col, token)).limit(1);
  return rows[0] ?? null;
}

const passwordSchema = z.string().min(10).max(128).refine(
  p => validatePassword(p).ok,
  p => ({ message: validatePassword(p).message ?? "Password does not meet requirements" })
);

// ─── Router ───────────────────────────────────────────────────
export const clientAuthRouter = router({

  /** Admin: generate & email an invite link for a client */
  generateInvite: adminProcedure
    .input(z.object({ clientId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const rows = await db.select().from(clients).where(eq(clients.id, input.clientId)).limit(1);
      const client = rows[0];
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });

      const token = generateToken();
      const expiry = new Date(Date.now() + INVITE_TTL_MS);

      await db.update(clients)
        .set({ inviteToken: token, inviteTokenExpiry: expiry })
        .where(eq(clients.id, input.clientId));

      const inviteUrl = `${ENV.siteUrl}/client/setup?token=${token}`;
      await sendClientInvite(client.contactEmail, client.contactName, inviteUrl);
      await writeAudit(input.clientId, "invite_sent", ctx.req, { email: client.contactEmail });

      return { inviteUrl }; // returned so admin can share manually if email fails
    }),

  /** Public: validate invite token — called by setup page on load */
  verifyInviteToken: publicProcedure
    .input(z.object({ token: z.string().length(64) }))
    .query(async ({ input }) => {
      const client = await findClientByToken("inviteToken", input.token);
      if (!client || !client.inviteTokenExpiry || client.inviteTokenExpiry < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired invite link" });
      }
      return { email: client.contactEmail, businessName: client.businessName };
    }),

  /** Public: set password + consent — completes account setup */
  setup: publicProcedure
    .input(z.object({
      token: z.string().length(64),
      password: passwordSchema,
      consentAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the Privacy Policy to continue" }) }),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const client = await findClientByToken("inviteToken", input.token);
      if (!client || !client.inviteTokenExpiry || client.inviteTokenExpiry < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired invite link" });
      }

      const passwordHash = await hashPassword(input.password);

      await db.update(clients).set({
        passwordHash,
        emailVerified: true,
        inviteToken: null,
        inviteTokenExpiry: null,
        consentGivenAt: new Date(),
        consentVersion: PRIVACY_POLICY_VERSION,
        failedLoginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: getIp(ctx.req),
      }).where(eq(clients.id, client.id));

      const sessionToken = await createClientSession({
        clientId: client.id,
        email: client.contactEmail,
        businessName: client.businessName,
      });
      const cookieOpts = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(CLIENT_COOKIE_NAME, sessionToken, { ...cookieOpts, maxAge: THIRTY_DAYS_MS });

      await writeAudit(client.id, "account_setup", ctx.req);
      return { success: true } as const;
    }),

  /** Public: email + password login */
  login: publicProcedure
    .input(z.object({
      email: z.string().email().max(320),
      password: z.string().min(1).max(128),
    }))
    .mutation(async ({ input, ctx }) => {
      const GENERIC_ERROR = "Invalid email or password"; // never reveal which field is wrong

      const client = await findClientByEmail(input.email.toLowerCase());

      // Account not found — still do a dummy bcrypt compare to prevent timing attacks
      if (!client || !client.passwordHash || !client.emailVerified) {
        await bcryptDummy();
        await writeAudit(null, "login_failed_unknown", ctx.req, { email: input.email });
        throw new TRPCError({ code: "UNAUTHORIZED", message: GENERIC_ERROR });
      }

      // Check lockout
      if (client.lockoutUntil && client.lockoutUntil > new Date()) {
        const minutesLeft = Math.ceil((client.lockoutUntil.getTime() - Date.now()) / 60000);
        await writeAudit(client.id, "login_blocked_lockout", ctx.req);
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Account locked. Try again in ${minutesLeft} minutes.` });
      }

      const passwordOk = await verifyPassword(input.password, client.passwordHash);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (!passwordOk) {
        const attempts = (client.failedLoginAttempts ?? 0) + 1;
        const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;
        await db.update(clients).set({
          failedLoginAttempts: attempts,
          lockoutUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        }).where(eq(clients.id, client.id));

        await writeAudit(client.id, "login_failed_password", ctx.req, { attempts });
        const msg = shouldLock
          ? "Too many failed attempts. Account locked for 30 minutes."
          : GENERIC_ERROR;
        throw new TRPCError({ code: "UNAUTHORIZED", message: msg });
      }

      // Success — reset lockout, record login
      await db.update(clients).set({
        failedLoginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: getIp(ctx.req),
      }).where(eq(clients.id, client.id));

      const sessionToken = await createClientSession({
        clientId: client.id,
        email: client.contactEmail,
        businessName: client.businessName,
      });
      const cookieOpts = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(CLIENT_COOKIE_NAME, sessionToken, { ...cookieOpts, maxAge: THIRTY_DAYS_MS });

      await writeAudit(client.id, "login_success", ctx.req);
      return { success: true } as const;
    }),

  /** Protected: current client session */
  me: clientProcedure.query(({ ctx }) => ({
    id: ctx.client.id,
    businessName: ctx.client.businessName,
    contactName: ctx.client.contactName,
    email: ctx.client.contactEmail,
    status: ctx.client.status,
  })),

  /** Protected: logout */
  logout: clientProcedure.mutation(async ({ ctx }) => {
    const cookieOpts = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(CLIENT_COOKIE_NAME, { ...cookieOpts, maxAge: -1 });
    await writeAudit(ctx.client.id, "logout", ctx.req);
    return { success: true } as const;
  }),

  /** Public: request password reset email */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email().max(320) }))
    .mutation(async ({ input, ctx }) => {
      // Always return success — never confirm whether email exists (POPIA/security)
      const client = await findClientByEmail(input.email.toLowerCase());
      if (client?.emailVerified) {
        const db = await getDb();
        if (db) {
          const token = generateToken();
          await db.update(clients).set({
            passwordResetToken: token,
            passwordResetExpiry: new Date(Date.now() + RESET_TTL_MS),
          }).where(eq(clients.id, client.id));

          const resetUrl = `${ENV.siteUrl}/client/reset-password?token=${token}`;
          await sendPasswordReset(client.contactEmail, client.contactName, resetUrl);
          await writeAudit(client.id, "password_reset_requested", ctx.req);
        }
      }
      return { success: true } as const;
    }),

  /** Public: reset password with token */
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string().length(64),
      password: passwordSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const client = await findClientByToken("passwordResetToken", input.token);
      if (!client || !client.passwordResetExpiry || client.passwordResetExpiry < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset link" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(clients).set({
        passwordHash: await hashPassword(input.password),
        passwordResetToken: null,
        passwordResetExpiry: null,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      }).where(eq(clients.id, client.id));

      await writeAudit(client.id, "password_reset_completed", ctx.req);
      return { success: true } as const;
    }),
});

/** Constant-time dummy compare — prevents email enumeration via timing */
async function bcryptDummy() {
  await verifyPassword("dummy", "$2b$12$invalidhashpaddingtomakethislookrealistic000000000000000");
}
