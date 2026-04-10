import "dotenv/config";
import helmet from "helmet";
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import net from "net";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import whatsappWebhookRouter from "../whatsapp-webhook";
import facebookWebhookRouter from "../facebook-webhook";
import payfastWebhookRouter from "../payfast-webhook";
import vapiWebhookRouter from "../vapi-webhook";

// ─── Port helpers ─────────────────────────────────────────────
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(start = 3000): Promise<number> {
  for (let port = start; port < start + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port starting from ${start}`);
}

// ─── Rate limiters ────────────────────────────────────────────
// Protects the AI chat endpoint from abuse and runaway API costs.
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute window
  max: 20,                // 20 messages per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please wait a moment." },
  skip: () => process.env.NODE_ENV !== "production",
});

// General API rate limiter — prevents bulk scraping
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production",
});

// Webhook endpoints get a more generous limit (Meta sends bursts)
const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Client auth: 5 attempts per 15 min — brute-force protection
const clientAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts — please wait 15 minutes." },
  skip: () => process.env.NODE_ENV !== "production",
});

// ─── Server startup ───────────────────────────────────────────
async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Trust proxy (LiteSpeed / Nginx reverse proxy) ─────────────
  // Required so req.protocol correctly reads "https" from X-Forwarded-Proto.
  // Without this, sameSite:"none" cookies are rejected by browsers because
  // secure:true cannot be set when Express thinks the request is plain HTTP.
  app.set("trust proxy", true);

  // ── Security headers ─────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'", "https://www.payfast.co.za"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }));

  // ── Body parsing: capture rawBody for HMAC webhook verification ──
  // Must be configured before any routes that need req.rawBody.
  app.use(
    express.json({
      limit: "50mb",
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  // ── Health check (no auth, no rate limit) ────────────────────
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version ?? "1.0.0",
      env: process.env.NODE_ENV ?? "development",
    });
  });

  // ── OAuth ────────────────────────────────────────────────────
  registerOAuthRoutes(app);

  // ── Webhooks (before general rate limiter) ───────────────────
  app.use("/api/whatsapp", webhookRateLimiter, whatsappWebhookRouter);
  app.use("/api/facebook", webhookRateLimiter, facebookWebhookRouter);

  // PayFast ITN uses URL-encoded body — must not have JSON middleware applied.
  // express.urlencoded is already registered globally above, so this works.
  app.use("/api/payfast", webhookRateLimiter, payfastWebhookRouter);
  app.use("/api/vapi", webhookRateLimiter, vapiWebhookRouter);

  // PayFast return/cancel redirects
  app.get("/api/payfast/return", (_req: Request, res: Response) => {
    res.redirect("/payment/success");
  });
  app.get("/api/payfast/cancel", (_req: Request, res: Response) => {
    res.redirect("/pricing?cancelled=true");
  });

  // ── Client auth — tighter rate limit ────────────────────────
  app.use("/api/trpc/clientAuth.login", clientAuthLimiter);
  app.use("/api/trpc/clientAuth.setup", clientAuthLimiter);
  app.use("/api/trpc/clientAuth.resetPassword", clientAuthLimiter);

  // ── tRPC API with rate limiting ──────────────────────────────
  // Apply tighter limit specifically to aiChat procedures
  app.use(
    "/api/trpc/aiChat",
    chatRateLimiter,
    createExpressMiddleware({ router: appRouter, createContext }),
  );
  app.use(
    "/api/trpc",
    apiRateLimiter,
    createExpressMiddleware({ router: appRouter, createContext }),
  );

  // ── Static files / Vite dev server ──────────────────────────
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ── Global error handler ─────────────────────────────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[Server] Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  });

  // ── Start listening ──────────────────────────────────────────
  const preferredPort = parseInt(process.env.PORT ?? "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} busy, using ${port}`);
  }

  server.listen(port, () => {
    console.log(`\n🚀 Manna Agency Hub running on http://localhost:${port}/`);
    console.log(`   Environment : ${process.env.NODE_ENV ?? "development"}`);
    console.log(`   Health check: http://localhost:${port}/api/health\n`);
  });
}

startServer().catch(console.error);
