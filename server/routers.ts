import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { crmRouter } from "./routers/crm";
import { analyticsRouter } from "./routers/analytics";
import { botLeadsRouter } from "./routers/botLeads";
import { aiChatRouter } from "./routers/aiChat";
import { facebookLeadsRouter } from "./routers/facebookLeads";
import { clientAuthRouter } from "./routers/clientAuth";
import { clientPortalRouter } from "./routers/clientPortal";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        if (!ENV.adminEmail || !ENV.adminPassword) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Admin credentials not configured" });
        }
        if (input.email !== ENV.adminEmail || input.password !== ENV.adminPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        await db.upsertUser({
          openId: "admin",
          name: "Admin",
          email: input.email,
          loginMethod: "password",
          role: "admin",
          lastSignedIn: new Date(),
        });
        const sessionToken = await sdk.createSessionToken("admin", {
          name: "Admin",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  crm: crmRouter,
  analytics: analyticsRouter,
  botLeads: botLeadsRouter,
  aiChat: aiChatRouter,
  facebookLeads: facebookLeadsRouter,
  clientAuth: clientAuthRouter,
  clientPortal: clientPortalRouter,
});

export type AppRouter = typeof appRouter;
