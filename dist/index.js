// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { desc } from "drizzle-orm";

// drizzle/schema.ts
import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessType: varchar("businessType", { length: 100 }),
  location: varchar("location", { length: 255 }),
  status: mysqlEnum("status", ["prospect", "call_booked", "client", "not_interested", "on_hold"]).default("prospect").notNull(),
  painPoint: text("painPoint"),
  serviceInterest: varchar("serviceInterest", { length: 255 }),
  callbackNumber: varchar("callbackNumber", { length: 20 }),
  outreachDate: timestamp("outreachDate"),
  lastFollowUp: timestamp("lastFollowUp"),
  nextFollowUp: timestamp("nextFollowUp"),
  notes: text("notes"),
  source: varchar("source", { length: 50 }).default("apollo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessType: varchar("businessType", { length: 100 }),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }).notNull(),
  location: varchar("location", { length: 255 }),
  monthlyRetainer: decimal("monthlyRetainer", { precision: 10, scale: 2 }).notNull(),
  setupFee: decimal("setupFee", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["active", "paused", "cancelled", "trial"]).default("active").notNull(),
  contractStartDate: timestamp("contractStartDate"),
  contractEndDate: timestamp("contractEndDate"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentStatus: mysqlEnum("paymentStatus", ["current", "overdue", "failed", "pending"]).default("current"),
  nextBillingDate: timestamp("nextBillingDate"),
  notes: text("notes"),
  /** Client portal access code — crypto-random, e.g. FALCON-MANGO-7291 */
  accessCode: varchar("accessCode", { length: 50 }).unique(),
  /** PayFast m_payment_id used in subscription forms to link ITNs back to client */
  merchantPaymentId: varchar("merchantPaymentId", { length: 100 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  botName: varchar("botName", { length: 255 }),
  whatChimpBotId: varchar("whatChimpBotId", { length: 255 }),
  whatsappNumber: varchar("whatsappNumber", { length: 20 }),
  status: mysqlEnum("status", ["discovery", "setup", "training", "testing", "live", "maintenance", "paused"]).default("discovery").notNull(),
  discoveryDate: timestamp("discoveryDate"),
  setupStartDate: timestamp("setupStartDate"),
  goLiveDate: timestamp("goLiveDate"),
  completionDate: timestamp("completionDate"),
  services: varchar("services", { length: 500 }),
  botDescription: text("botDescription"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  invoiceType: mysqlEnum("invoiceType", ["setup", "retainer", "one_off"]).default("retainer").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  payFastReference: varchar("payFastReference", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var botConnections = mysqlTable("bot_connections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  whatChimpBotId: varchar("whatChimpBotId", { length: 255 }).notNull(),
  whatsappNumber: varchar("whatsappNumber", { length: 20 }).notNull(),
  apiKey: varchar("apiKey", { length: 500 }),
  status: mysqlEnum("status", ["connected", "disconnected", "error"]).default("connected"),
  lastSyncDate: timestamp("lastSyncDate"),
  totalConversations: int("totalConversations").default(0),
  totalMessages: int("totalMessages").default(0),
  averageResponseTime: int("averageResponseTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId"),
  projectId: int("projectId"),
  leadId: int("leadId"),
  taskType: mysqlEnum("taskType", ["onboarding", "follow_up", "milestone", "reminder", "payment", "support"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  assignedTo: varchar("assignedTo", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var botLeads = mysqlTable("bot_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  language: varchar("language", { length: 10 }).default("en"),
  conversationSummary: text("conversationSummary"),
  source: varchar("source", { length: 50 }).default("website_bot"),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "lost"]).default("new").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var facebookLeads = mysqlTable("facebook_leads", {
  id: int("id").autoincrement().primaryKey(),
  leadgenId: varchar("leadgenId", { length: 100 }).notNull().unique(),
  formId: varchar("formId", { length: 100 }),
  adId: varchar("adId", { length: 100 }),
  adgroupId: varchar("adgroupId", { length: 100 }),
  pageId: varchar("pageId", { length: 100 }),
  campaignName: varchar("campaignName", { length: 255 }),
  formName: varchar("formName", { length: 255 }),
  adName: varchar("adName", { length: 255 }),
  // Lead contact info (fetched from Graph API)
  fullName: varchar("fullName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 255 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("jobTitle", { length: 255 }),
  // All raw field data as JSON
  rawFieldData: text("rawFieldData"),
  // Processing status
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "lost", "synced_to_crm"]).default("new").notNull(),
  whatsappFollowUpSent: int("whatsappFollowUpSent").default(0),
  crmLeadId: int("crmLeadId"),
  notes: text("notes"),
  fbCreatedTime: timestamp("fbCreatedTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  /** PayFast's unique pf_payment_id — the dedup key */
  payfastPaymentId: varchar("payfastPaymentId", { length: 100 }).notNull().unique(),
  /** Optional back-reference to our internal client (via m_payment_id lookup) */
  merchantPaymentId: varchar("merchantPaymentId", { length: 100 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  itemName: varchar("itemName", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["COMPLETE", "FAILED", "PENDING", "CANCELLED", "UNKNOWN"]).notNull(),
  /** 1 if our MD5 check passed, 0 if it failed (stored for forensics) */
  signatureValid: int("signatureValid").default(0),
  /** Full raw ITN payload as JSON — enables replay if processing failed */
  rawItn: text("rawItn").notNull(),
  processedAt: timestamp("processedAt").defaultNow().notNull()
});
var subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().unique(),
  payfastToken: varchar("payfastToken", { length: 100 }),
  payfastSubscriptionId: varchar("payfastSubscriptionId", { length: 100 }),
  packageName: mysqlEnum("packageName", ["starter", "bundle", "chatbot", "social"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["active", "paused", "cancelled", "failed"]).default("active").notNull(),
  failedCount: int("failedCount").default(0),
  nextRunDate: timestamp("nextRunDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  // ── Manus platform ──────────────────────────────────────────
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
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
  payfastPassphrase: process.env.PAYFAST_PASSPHRASE ?? "",
  payfastSandbox: process.env.PAYFAST_SANDBOX === "true",
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
  smtpPass: process.env.SMTP_PASS ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createLead(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(data);
  return result;
}
async function getLeadById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}
async function listLeads(filters) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(leads);
  if (filters?.status) {
    query = query.where(eq(leads.status, filters.status));
  }
  return query;
}
async function updateLead(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set(data).where(eq(leads.id, id));
  return getLeadById(id);
}
async function createClient(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}
async function getClientById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}
async function listClients(filters) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(clients);
  if (filters?.status) {
    query = query.where(eq(clients.status, filters.status));
  }
  return query;
}
async function updateClient(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
  return getClientById(id);
}
async function createProject(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return result;
}
async function getProjectById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}
async function listProjectsByClient(clientId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(projects).where(eq(projects.clientId, clientId));
}
async function updateProject(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
  return getProjectById(id);
}
async function createInvoice(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoices).values(data);
  return result;
}
async function getInvoiceById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0];
}
async function listInvoicesByClient(clientId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(invoices).where(eq(invoices.clientId, clientId));
}
async function updateInvoice(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
  return getInvoiceById(id);
}
async function createTask(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  return result;
}
async function getTaskById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0];
}
async function listTasks(filters) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(tasks);
  if (filters?.status) {
    query = query.where(eq(tasks.status, filters.status));
  }
  return query;
}
async function updateTask(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return getTaskById(id);
}
async function listBotLeads() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(botLeads).orderBy(desc(botLeads.createdAt));
}
async function updateBotLead(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(botLeads).set(data).where(eq(botLeads.id, id));
  const result = await db.select().from(botLeads).where(eq(botLeads.id, id)).limit(1);
  return result[0];
}
async function createFacebookLead(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(facebookLeads).values(data);
  return result;
}
async function getFacebookLeadByLeadgenId(leadgenId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(facebookLeads).where(eq(facebookLeads.leadgenId, leadgenId)).limit(1);
  return result[0];
}
async function listFacebookLeads(filters) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(facebookLeads).orderBy(desc(facebookLeads.createdAt));
  if (filters?.status) {
    query = db.select().from(facebookLeads).where(eq(facebookLeads.status, filters.status)).orderBy(desc(facebookLeads.createdAt));
  }
  return query;
}
async function updateFacebookLead(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(facebookLeads).set(data).where(eq(facebookLeads.id, id));
  const result = await db.select().from(facebookLeads).where(eq(facebookLeads.id, id)).limit(1);
  return result[0];
}
async function syncFacebookLeadToCRM(fbLeadId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const fbLead = await db.select().from(facebookLeads).where(eq(facebookLeads.id, fbLeadId)).limit(1);
  if (!fbLead[0]) throw new Error("Facebook lead not found");
  const fl = fbLead[0];
  const crmLead = {
    name: fl.fullName || "Facebook Lead",
    email: fl.email,
    phone: fl.phone,
    businessName: fl.company || "Unknown",
    businessType: fl.jobTitle || void 0,
    location: fl.city || void 0,
    status: "prospect",
    source: "facebook_ads",
    notes: `From Facebook Lead Ad. Form: ${fl.formName || fl.formId}. Ad: ${fl.adName || fl.adId}. Campaign: ${fl.campaignName || "N/A"}.`
  };
  const result = await db.insert(leads).values(crmLead);
  const insertId = result[0]?.insertId;
  await db.update(facebookLeads).set({ status: "synced_to_crm", crmLeadId: insertId }).where(eq(facebookLeads.id, fbLeadId));
  return insertId;
}
async function createPaymentIfNew(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create payment: database not available");
    return false;
  }
  try {
    await db.execute(
      `INSERT IGNORE INTO payments
         (payfastPaymentId, merchantPaymentId, amount, itemName, paymentStatus, signatureValid, rawItn, processedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.payfastPaymentId,
        data.merchantPaymentId ?? null,
        data.amount,
        data.itemName ?? null,
        data.paymentStatus,
        data.signatureValid,
        data.rawItn
      ]
    );
    const [[{ affectedRows }]] = await db.execute(
      "SELECT ROW_COUNT() AS affectedRows"
    );
    return Number(affectedRows) > 0;
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") return false;
    throw err;
  }
}
async function updateClientPaymentStatus(merchantPaymentId, paymentStatus) {
  const db = await getDb();
  if (!db) return;
  await db.execute(
    `UPDATE clients SET paymentStatus = ?, updatedAt = NOW() WHERE merchantPaymentId = ?`,
    [paymentStatus, merchantPaymentId]
  );
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/crm.ts
import { z as z2 } from "zod";
var crmRouter = router({
  // ============================================================
  // LEADS
  // ============================================================
  leads: router({
    create: protectedProcedure.input(
      z2.object({
        name: z2.string(),
        email: z2.string().email().optional(),
        phone: z2.string().optional(),
        businessName: z2.string(),
        businessType: z2.string().optional(),
        location: z2.string().optional(),
        painPoint: z2.string().optional(),
        serviceInterest: z2.string().optional(),
        callbackNumber: z2.string().optional(),
        notes: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      return createLead({
        ...input,
        status: "prospect",
        outreachDate: /* @__PURE__ */ new Date()
      });
    }),
    get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getLeadById(input.id);
    }),
    list: protectedProcedure.input(
      z2.object({
        status: z2.string().optional(),
        source: z2.string().optional()
      })
    ).query(async ({ input }) => {
      const query = await listLeads(input);
      return query;
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        status: z2.enum(["prospect", "call_booked", "client", "not_interested", "on_hold"]).optional(),
        notes: z2.string().optional(),
        lastFollowUp: z2.date().optional(),
        nextFollowUp: z2.date().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateLead(id, data);
    }),
    convertToClient: protectedProcedure.input(
      z2.object({
        leadId: z2.number(),
        monthlyRetainer: z2.number(),
        setupFee: z2.number().optional()
      })
    ).mutation(async ({ input }) => {
      const lead = await getLeadById(input.leadId);
      if (!lead) throw new Error("Lead not found");
      const client = await createClient({
        leadId: input.leadId,
        businessName: lead.businessName,
        businessType: lead.businessType || void 0,
        contactName: lead.name,
        contactEmail: lead.email || "",
        contactPhone: lead.callbackNumber || lead.phone || "",
        location: lead.location || void 0,
        monthlyRetainer: input.monthlyRetainer.toString(),
        setupFee: input.setupFee ? input.setupFee.toString() : void 0,
        status: "trial",
        contractStartDate: /* @__PURE__ */ new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
      });
      await updateLead(input.leadId, { status: "client" });
      return client;
    })
  }),
  // ============================================================
  // CLIENTS
  // ============================================================
  clients: router({
    get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getClientById(input.id);
    }),
    list: protectedProcedure.input(z2.object({ status: z2.string().optional() })).query(async ({ input }) => {
      const query = await listClients(input);
      return query;
    }),
    update: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        monthlyRetainer: z2.number().optional(),
        status: z2.enum(["active", "paused", "cancelled", "trial"]).optional(),
        paymentStatus: z2.enum(["current", "overdue", "failed", "pending"]).optional(),
        notes: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData = { ...data };
      if (data.monthlyRetainer) {
        updateData.monthlyRetainer = data.monthlyRetainer.toString();
      }
      return updateClient(id, updateData);
    })
  }),
  // ============================================================
  // PROJECTS
  // ============================================================
  projects: router({
    create: protectedProcedure.input(
      z2.object({
        clientId: z2.number(),
        projectName: z2.string(),
        services: z2.string().optional(),
        botDescription: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      return createProject({
        ...input,
        status: "discovery",
        discoveryDate: /* @__PURE__ */ new Date()
      });
    }),
    get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getProjectById(input.id);
    }),
    listByClient: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ input }) => {
      return listProjectsByClient(input.clientId);
    }),
    updateStatus: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        status: z2.enum([
          "discovery",
          "setup",
          "training",
          "testing",
          "live",
          "maintenance",
          "paused"
        ])
      })
    ).mutation(async ({ input }) => {
      const { id, status } = input;
      const updateData = { status };
      if (status === "live") {
        updateData.goLiveDate = /* @__PURE__ */ new Date();
      } else if (status === "setup") {
        updateData.setupStartDate = /* @__PURE__ */ new Date();
      }
      return updateProject(id, updateData);
    }),
    updateWhatChimpConnection: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        whatChimpBotId: z2.string(),
        whatsappNumber: z2.string()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateProject(id, data);
    })
  }),
  // ============================================================
  // INVOICES
  // ============================================================
  invoices: router({
    create: protectedProcedure.input(
      z2.object({
        clientId: z2.number(),
        invoiceType: z2.enum(["setup", "retainer", "one_off"]),
        amount: z2.number(),
        description: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const invoiceNumber = `INV-${Date.now()}`;
      return createInvoice({
        ...input,
        invoiceNumber,
        amount: input.amount.toString(),
        status: "draft",
        issueDate: /* @__PURE__ */ new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
      });
    }),
    get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getInvoiceById(input.id);
    }),
    listByClient: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ input }) => {
      return listInvoicesByClient(input.clientId);
    }),
    updateStatus: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        status: z2.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
        paidDate: z2.date().optional()
      })
    ).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateInvoice(id, data);
    })
  }),
  // ============================================================
  // TASKS
  // ============================================================
  tasks: router({
    create: protectedProcedure.input(
      z2.object({
        clientId: z2.number().optional(),
        projectId: z2.number().optional(),
        leadId: z2.number().optional(),
        taskType: z2.enum([
          "onboarding",
          "follow_up",
          "milestone",
          "reminder",
          "payment",
          "support"
        ]),
        title: z2.string(),
        description: z2.string().optional(),
        dueDate: z2.date(),
        priority: z2.enum(["low", "medium", "high", "urgent"]).optional()
      })
    ).mutation(async ({ input }) => {
      return createTask({
        ...input,
        status: "pending"
      });
    }),
    get: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getTaskById(input.id);
    }),
    list: protectedProcedure.input(
      z2.object({
        status: z2.string().optional(),
        clientId: z2.number().optional()
      })
    ).query(async ({ input }) => {
      const query = await listTasks(input);
      return query;
    }),
    updateStatus: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        status: z2.enum(["pending", "in_progress", "completed", "cancelled"])
      })
    ).mutation(async ({ input }) => {
      const { id, status } = input;
      const updateData = { status };
      if (status === "completed") {
        updateData.completedDate = /* @__PURE__ */ new Date();
      }
      return updateTask(id, updateData);
    })
  })
});

// server/routers/analytics.ts
import { z as z3 } from "zod";
import { eq as eq2 } from "drizzle-orm";
var analyticsRouter = router({
  // Dashboard metrics
  dashboardMetrics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const activeClientsResult = await db.select().from(clients).where(eq2(clients.status, "active"));
    const activeClientsCount = activeClientsResult.length;
    let mrr = 0;
    for (const client of activeClientsResult) {
      const amount = typeof client.monthlyRetainer === "string" ? parseFloat(client.monthlyRetainer) : client.monthlyRetainer;
      mrr += amount;
    }
    const leadsResult = await db.select().from(leads);
    const totalLeads = leadsResult.length;
    const clientsFromLeads = leadsResult.filter(
      (l) => l.status === "client"
    ).length;
    const conversionRate = totalLeads > 0 ? Math.round(clientsFromLeads / totalLeads * 100) : 0;
    const liveProjectsResult = await db.select().from(projects).where(eq2(projects.status, "live"));
    const liveProjectsCount = liveProjectsResult.length;
    return {
      activeClients: activeClientsCount,
      mrr: Math.round(mrr * 100) / 100,
      totalLeads,
      conversionRate,
      liveProjects: liveProjectsCount
    };
  }),
  // Lead pipeline funnel
  leadPipeline: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const leadsData = await db.select().from(leads);
    const pipeline = {
      prospect: leadsData.filter((l) => l.status === "prospect").length,
      callBooked: leadsData.filter((l) => l.status === "call_booked").length,
      client: leadsData.filter((l) => l.status === "client").length,
      notInterested: leadsData.filter((l) => l.status === "not_interested").length
    };
    return pipeline;
  }),
  // Revenue analytics
  revenueAnalytics: protectedProcedure.input(z3.object({ months: z3.number().default(6) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const invoicesData = await db.select().from(invoices);
    const monthlyRevenue = {};
    invoicesData.forEach((invoice) => {
      if (invoice.status === "paid") {
        const date = invoice.paidDate || invoice.issueDate;
        const monthKey = date ? new Date(date).toISOString().slice(0, 7) : "unknown";
        const amount = typeof invoice.amount === "string" ? parseFloat(invoice.amount) : invoice.amount;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount;
      }
    });
    return monthlyRevenue;
  }),
  // Client lifetime value
  clientLifetimeValue: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const client = await db.select().from(clients).where(eq2(clients.id, input.clientId)).limit(1);
    if (!client.length) throw new Error("Client not found");
    const clientData = client[0];
    const invoicesData = await db.select().from(invoices).where(eq2(invoices.clientId, input.clientId));
    let totalPaid = 0;
    invoicesData.forEach((inv) => {
      if (inv.status === "paid") {
        const amount = typeof inv.amount === "string" ? parseFloat(inv.amount) : inv.amount;
        totalPaid += amount;
      }
    });
    const monthlyRetainer = typeof clientData.monthlyRetainer === "string" ? parseFloat(clientData.monthlyRetainer) : clientData.monthlyRetainer;
    const projectedLTV = monthlyRetainer * 12;
    return {
      totalPaid: Math.round(totalPaid * 100) / 100,
      projectedLTV: Math.round(projectedLTV * 100) / 100,
      monthlyRetainer: Math.round(monthlyRetainer * 100) / 100
    };
  }),
  // Project status breakdown
  projectStatusBreakdown: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const projectsData = await db.select().from(projects);
    const breakdown = {
      discovery: projectsData.filter((p) => p.status === "discovery").length,
      setup: projectsData.filter((p) => p.status === "setup").length,
      training: projectsData.filter((p) => p.status === "training").length,
      testing: projectsData.filter((p) => p.status === "testing").length,
      live: projectsData.filter((p) => p.status === "live").length,
      maintenance: projectsData.filter((p) => p.status === "maintenance").length,
      paused: projectsData.filter((p) => p.status === "paused").length
    };
    return breakdown;
  }),
  // Payment status overview
  paymentStatusOverview: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const clientsData = await db.select().from(clients);
    const overview = {
      current: clientsData.filter((c) => c.paymentStatus === "current").length,
      overdue: clientsData.filter((c) => c.paymentStatus === "overdue").length,
      failed: clientsData.filter((c) => c.paymentStatus === "failed").length,
      pending: clientsData.filter((c) => c.paymentStatus === "pending").length
    };
    return overview;
  })
});

// server/routers/botLeads.ts
import { z as z4 } from "zod";
var botLeadsRouter = router({
  /**
   * Save a new lead from the chatbot
   */
  saveLead: publicProcedure.input(
    z4.object({
      name: z4.string().min(1, "Name is required"),
      businessName: z4.string().optional(),
      phone: z4.string().optional(),
      email: z4.string().email().optional(),
      language: z4.string().default("en"),
      conversationSummary: z4.string().optional()
    })
  ).mutation(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const leadId = crypto.randomUUID();
      const now = Date.now();
      const result = await db.execute(
        `INSERT INTO bot_leads (
            id, name, business_name, phone, email, language, 
            conversation_summary, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leadId,
          input.name,
          input.businessName || null,
          input.phone || null,
          input.email || null,
          input.language,
          input.conversationSummary || null,
          "new",
          now,
          now
        ]
      );
      return {
        success: true,
        leadId,
        message: "Lead saved successfully"
      };
    } catch (error) {
      console.error("Error saving bot lead:", error);
      throw new Error("Failed to save lead. Please try again.");
    }
  }),
  /**
   * Get all bot leads
   */
  getLeads: publicProcedure.input(
    z4.object({
      status: z4.string().optional(),
      language: z4.string().optional(),
      limit: z4.number().default(50),
      offset: z4.number().default(0)
    })
  ).query(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let query = "SELECT * FROM bot_leads WHERE 1=1";
      const params = [];
      if (input.status) {
        query += " AND status = ?";
        params.push(input.status);
      }
      if (input.language) {
        query += " AND language = ?";
        params.push(input.language);
      }
      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(input.limit, input.offset);
      const leads2 = await db.execute(query, params);
      return {
        success: true,
        leads: leads2 || [],
        count: leads2?.length || 0
      };
    } catch (error) {
      console.error("Error fetching bot leads:", error);
      throw new Error("Failed to fetch leads");
    }
  }),
  /**
   * Update lead status
   */
  updateLeadStatus: publicProcedure.input(
    z4.object({
      leadId: z4.string(),
      status: z4.enum(["new", "contacted", "qualified", "converted", "lost"])
    })
  ).mutation(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const now = Date.now();
      await db.execute(
        "UPDATE bot_leads SET status = ?, updated_at = ? WHERE id = ?",
        [input.status, now, input.leadId]
      );
      return {
        success: true,
        message: "Lead status updated"
      };
    } catch (error) {
      console.error("Error updating lead status:", error);
      throw new Error("Failed to update lead status");
    }
  }),
  /**
   * Get lead statistics
   */
  getStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const stats = await db.execute(
        `SELECT 
          COUNT(*) as total_leads,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
          SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
          SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads,
          SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted_leads
        FROM bot_leads`
      );
      return {
        success: true,
        stats: stats?.[0] || {
          total_leads: 0,
          new_leads: 0,
          contacted_leads: 0,
          qualified_leads: 0,
          converted_leads: 0
        }
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw new Error("Failed to fetch statistics");
    }
  })
});

// server/routers/aiChat.ts
import { z as z5 } from "zod";
import Anthropic from "@anthropic-ai/sdk";
var anthropic = new Anthropic({ apiKey: ENV.anthropicApiKey || process.env.ANTHROPIC_API_KEY });
var BOT_MODEL = "claude-haiku-4-5";
var MANNA_SYSTEM_PROMPT = `You are **Manna Bot**, the AI-powered virtual assistant for **Manna Digital Hub** \u2014 a South African AI automation agency that helps businesses stop losing leads, clients, and revenue by automating their customer communication.

## YOUR IDENTITY
- Name: Manna Bot
- Company: Manna Digital Hub
- Owner: Melanie Muller (also known as "Mela")
- Location: Garden Route, South Africa \u2014 serving businesses across Africa and beyond
- Phone: +27 73 406 1526
- Email: info@mannadigitalhub.co.za
- Website: mannadigitalhub.co.za

## YOUR PURPOSE
You are the PRODUCT ITSELF. You demonstrate what Manna Digital Hub can do for businesses. Every conversation you have is a live demo of the technology. You must be:
- Intelligent, warm, and professional
- Knowledgeable about AI automation for business
- A natural salesperson (soft-sell, never pushy)
- Able to qualify leads by understanding their business needs
- Multilingual \u2014 you speak ALL 11 South African official languages plus Portuguese, French, and Swahili

## LANGUAGE RULES
- Detect the user's language automatically and respond in that same language
- If they greet in Afrikaans, respond in Afrikaans. If Zulu, respond in Zulu. Etc.
- If uncertain, default to English
- You can switch languages mid-conversation if the user switches
- Supported languages: English, Afrikaans, isiZulu, isiXhosa, Sesotho, Setswana, Sepedi, Xitsonga, siSwati, Tshivenda, isiNdebele, Portuguese, French, Swahili

## SERVICES & PRICING
You know these services inside out:

### 1. WhatsApp Automation (WhatsApp Starter)
- What: AI-powered WhatsApp bot that responds to every message 24/7
- Setup: R2,500 \u2013 R5,000 (one-time)
- Monthly: R800 \u2013 R1,500
- Features: Auto-replies, lead capture, appointment booking, FAQ handling
- Best for: Businesses getting WhatsApp enquiries they can't answer fast enough

### 2. AI Website Chatbot (Chatbot Only)
- What: Intelligent chatbot on your website that captures leads and answers questions
- Setup: R3,000 \u2013 R6,000 (one-time)
- Monthly: R600 \u2013 R1,200
- Features: Natural conversation, lead qualification, multi-language, 24/7
- Best for: Businesses with websites that get traffic but don't convert

### 3. Automated Lead Follow-Up
- What: Automated sequences that follow up with leads via WhatsApp, email, SMS
- Setup: R2,000 \u2013 R4,000 (one-time)
- Monthly: R500 \u2013 R1,000
- Features: Drip campaigns, reminders, re-engagement, nurture sequences
- Best for: Businesses that lose deals because they forget to follow up

### 4. AI Complete Bundle (MOST POPULAR)
- What: All three services combined \u2014 the complete automation package
- Setup: R8,000 (one-time)
- Monthly: R2,500
- Includes: WhatsApp bot + Website chatbot + Lead follow-up
- Best for: Businesses that want the full automation experience

## HOW IT WORKS
1. **Free Discovery Call** \u2014 30-minute call to understand the business (no obligation)
2. **We Build It** \u2014 Manna configures and trains the AI in 48 hours
3. **You Approve** \u2014 Client reviews, requests tweaks, approves when happy
4. **It Runs Itself** \u2014 Automation goes live, works 24/7, client just monitors results

## KEY SELLING POINTS
- SA businesses respond 11 hours late on average \u2014 Manna responds in seconds
- 67% of customers leave if response is too slow
- 9\xD7 higher lead conversion with instant response
- Works during load-shedding (cloud-based, always on)
- No lock-in contracts \u2014 month-to-month
- 48-hour setup \u2014 live in 2 days
- No technical knowledge required \u2014 done-for-you service
- Built for South African realities (data costs, load-shedding, local languages)

## INDUSTRIES WE SERVE
Estate Agents, Guest Houses & Tourism, Retail & FMCG, Medical Professionals & Clinics, Trades & Services (plumbers, electricians), Restaurants & Food, Agriculture & Farming, Professional Services (lawyers, accountants)

## PAYMENT DETAILS
- EFT: MannaDigitalHub, Capitec Business, Account 1055056238, Branch 470010
- Month-to-month billing, no long-term contracts

## CONVERSATION GUIDELINES

### Lead Qualification Flow
When someone shows interest, naturally guide the conversation to understand:
1. Their business type / industry
2. Their current pain point (missing calls? losing leads? slow response?)
3. How many enquiries they get per day/week
4. What channels they use (WhatsApp, website, Facebook, etc.)
5. Their budget range

### When to Capture Lead Info
When someone is clearly interested (asks about pricing, wants a demo, asks how to get started), naturally ask for:
- Their name
- Business name
- Phone number or email
- What service interests them

When you have this info, include it in your response wrapped in a special tag:
[LEAD_CAPTURED: name="Their Name", business="Business Name", phone="Number", email="Email", interest="Service they want"]

### Tone & Style
- Be conversational, not robotic
- Use short paragraphs (2-3 sentences max per paragraph)
- Use emoji sparingly but naturally (1-2 per message max)
- Be enthusiastic about automation without being over-the-top
- Relate to SA business realities (load-shedding, after-hours, weekends)
- If they mention a specific industry, give a relevant example
- Always end with a question or clear next step

### What NOT to do
- Never make up features or services that don't exist
- Never promise specific results (say "typically" or "on average")
- Never share competitor information
- Never be negative about other tools (WhatChimp, Tidio, etc.)
- Never give technical implementation details
- Never say "I'm just a bot" \u2014 you ARE the product demonstration

### Escalation
If someone asks something you can't answer, or wants to speak to a human:
- Say: "Let me connect you with Mela \u2014 she's the founder and will take great care of you."
- Provide: WhatsApp +27 73 406 1526 or email info@mannadigitalhub.co.za

### Booking a Call
When someone wants to book a discovery call:
- Provide the WhatsApp link: https://wa.me/27734061526?text=Hi%2C%20I%20want%20a%20free%20discovery%20call
- Mention it's free, 30 minutes, no obligation
- Say they can also email info@mannadigitalhub.co.za

Remember: You are the living proof that this technology works. Every great conversation you have is a sale waiting to happen.`;
var conversationStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1e3;
  for (const [id, conv] of Array.from(conversationStore.entries())) {
    if (conv.lastActivity < cutoff) conversationStore.delete(id);
  }
}, 30 * 60 * 1e3);
function getOrCreateConversation(sessionId) {
  let conv = conversationStore.get(sessionId);
  if (!conv) {
    conv = { messages: [], lastActivity: Date.now(), leadCaptured: false };
    conversationStore.set(sessionId, conv);
  }
  conv.lastActivity = Date.now();
  if (conv.messages.length > 40) {
    conv.messages = conv.messages.slice(-40);
  }
  return conv;
}
function extractLeadData(response) {
  const match = response.match(/\[LEAD_CAPTURED:\s*([\s\S]+?)\]/);
  if (!match) return { cleanResponse: response, leadData: null };
  const leadData = {};
  const fields = match[1].match(/(\w+)="([^"]*?)"/g) ?? [];
  for (const field of fields) {
    const eqIdx = field.indexOf("=");
    const key = field.slice(0, eqIdx);
    const value = field.slice(eqIdx + 2, -1);
    leadData[key] = value;
  }
  const cleanResponse = response.replace(/\[LEAD_CAPTURED:[\s\S]*?\]/, "").trim();
  return { cleanResponse, leadData: Object.keys(leadData).length > 0 ? leadData : null };
}
async function saveLeadToDb(leadData, conversationSummary, source = "website_bot") {
  try {
    const db = await getDb();
    if (!db) return;
    await db.execute(
      `INSERT INTO bot_leads
         (name, business_name, phone, email, language, conversation_summary, source, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', NOW(), NOW())`,
      [
        leadData.name ?? "Unknown",
        leadData.business ?? null,
        leadData.phone ?? null,
        leadData.email ?? null,
        "en",
        conversationSummary,
        source
      ]
    );
    console.log(`[MannaBot] Lead saved: ${leadData.name} (${leadData.business ?? "N/A"})`);
  } catch (err) {
    console.error("[MannaBot] Failed to save lead:", err);
  }
}
async function callMannaBot(sessionMessages, newUserMessage) {
  const response = await anthropic.messages.create({
    model: BOT_MODEL,
    max_tokens: 1024,
    // System prompt with cache_control — static text qualifies for caching
    // on Haiku (min 4096 tokens). The prompt is ~1800 tokens so no cache hit
    // yet, but adding the marker costs nothing and future growth will benefit.
    system: [
      {
        type: "text",
        text: MANNA_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" }
      }
    ],
    messages: [
      // Inject prior conversation history
      ...sessionMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: newUserMessage }
    ]
  });
  const rawReply = response.content[0]?.type === "text" ? response.content[0].text : "How can I help your business today? \u{1F60A}";
  const { cleanResponse: reply } = extractLeadData(rawReply);
  return { reply, rawReply };
}
var aiChatRouter = router({
  /**
   * Send a message to Manna Bot and get an AI response.
   * The Anthropic API key is NEVER sent to the browser — all LLM calls are server-side.
   */
  sendMessage: publicProcedure.input(
    z5.object({
      sessionId: z5.string().min(1).max(128),
      message: z5.string().min(1).max(2e3)
    })
  ).mutation(async ({ input }) => {
    const { sessionId, message } = input;
    const conv = getOrCreateConversation(sessionId);
    try {
      const { reply, rawReply } = await callMannaBot(conv.messages, message);
      conv.messages.push({ role: "user", content: message });
      conv.messages.push({ role: "assistant", content: reply });
      const { leadData } = extractLeadData(rawReply);
      if (leadData && !conv.leadCaptured) {
        conv.leadCaptured = true;
        const summary = conv.messages.map((m) => `${m.role}: ${m.content}`).join("\n");
        await saveLeadToDb(leadData, summary, "website_bot");
      }
      return { success: true, message: reply, leadCaptured: !!leadData };
    } catch (err) {
      console.error("[MannaBot] Claude API error:", err);
      const fallback = "I'm having a moment \u2014 but I'm still here! \u{1F60A} Please try again, or reach Mela on WhatsApp: +27 73 406 1526";
      conv.messages.push({ role: "user", content: message });
      conv.messages.push({ role: "assistant", content: fallback });
      return { success: false, message: fallback, leadCaptured: false };
    }
  }),
  getHistory: publicProcedure.input(z5.object({ sessionId: z5.string() })).query(({ input }) => {
    const conv = conversationStore.get(input.sessionId);
    return { messages: conv?.messages ?? [] };
  }),
  clearHistory: publicProcedure.input(z5.object({ sessionId: z5.string() })).mutation(({ input }) => {
    conversationStore.delete(input.sessionId);
    return { success: true };
  })
});

// server/routers/facebookLeads.ts
import { z as z6 } from "zod";
var facebookLeadsRouter = router({
  // List all Facebook leads with optional status filter
  list: protectedProcedure.input(z6.object({ status: z6.string().optional() }).optional()).query(async ({ input }) => {
    return listFacebookLeads(input || void 0);
  }),
  // Update a Facebook lead's status or notes
  update: protectedProcedure.input(z6.object({
    id: z6.number(),
    status: z6.enum(["new", "contacted", "qualified", "converted", "lost", "synced_to_crm"]).optional(),
    notes: z6.string().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateFacebookLead(id, data);
  }),
  // Sync a Facebook lead to the CRM leads table
  syncToCRM: protectedProcedure.input(z6.object({ id: z6.number() })).mutation(async ({ input }) => {
    return syncFacebookLeadToCRM(input.id);
  }),
  // Get dashboard stats for Facebook leads
  stats: protectedProcedure.query(async () => {
    const allLeads = await listFacebookLeads();
    const total = allLeads.length;
    const newLeads = allLeads.filter((l) => l.status === "new").length;
    const contacted = allLeads.filter((l) => l.status === "contacted").length;
    const qualified = allLeads.filter((l) => l.status === "qualified").length;
    const converted = allLeads.filter((l) => l.status === "converted").length;
    const synced = allLeads.filter((l) => l.status === "synced_to_crm").length;
    return {
      total,
      new: newLeads,
      contacted,
      qualified,
      converted,
      synced
    };
  }),
  // List bot leads (website + WhatsApp)
  listBotLeads: protectedProcedure.query(async () => {
    return listBotLeads();
  }),
  // Update bot lead status
  updateBotLead: protectedProcedure.input(z6.object({
    id: z6.number(),
    status: z6.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
    notes: z6.string().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateBotLead(id, data);
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  crm: crmRouter,
  analytics: analyticsRouter,
  botLeads: botLeadsRouter,
  aiChat: aiChatRouter,
  facebookLeads: facebookLeadsRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var _dirname = path.dirname(fileURLToPath(import.meta.url));
async function setupVite(app, server) {
  const [{ createServer: createViteServer }, { nanoid }] = await Promise.all([
    import("vite"),
    import("nanoid")
  ]);
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        _dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path.resolve(_dirname, "../..", "dist", "public") : path.resolve(_dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/whatsapp-webhook.ts
import { Router } from "express";
import crypto2 from "crypto";
var router2 = Router();
var waConversations = /* @__PURE__ */ new Map();
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1e3;
  for (const [phone, conv] of Array.from(waConversations.entries())) {
    if (conv.lastActivity < cutoff) waConversations.delete(phone);
  }
}, 30 * 60 * 1e3);
function getOrCreateWAConv(phone) {
  let conv = waConversations.get(phone);
  if (!conv) {
    conv = { messages: [], lastActivity: Date.now(), leadCaptured: false };
    waConversations.set(phone, conv);
  }
  conv.lastActivity = Date.now();
  if (conv.messages.length > 40) conv.messages = conv.messages.slice(-40);
  return conv;
}
function verifyMetaSignature(rawBody, signature, secret) {
  if (!secret || !signature) return false;
  const [algo, hash] = signature.split("=");
  if (algo !== "sha256" || !hash) return false;
  const expected = crypto2.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto2.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}
router2.get("/webhook", (req, res) => {
  const verifyToken = ENV.whatsappVerifyToken;
  if (!verifyToken) {
    console.error("[WhatsApp] WHATSAPP_VERIFY_TOKEN is not set");
    return res.status(500).send("Server misconfigured");
  }
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp] Webhook verified");
    return res.status(200).send(challenge);
  }
  console.warn("[WhatsApp] Webhook verification failed \u2014 token mismatch");
  return res.status(403).send("Forbidden");
});
router2.post("/webhook", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const appSecret = ENV.facebookAppSecret;
  if (appSecret && req.rawBody) {
    if (!verifyMetaSignature(req.rawBody, signature, appSecret)) {
      console.warn("[WhatsApp] Invalid HMAC signature \u2014 rejecting webhook");
      return res.status(403).send("Forbidden");
    }
  }
  res.status(200).send("EVENT_RECEIVED");
  try {
    const body = req.body;
    if (body.object !== "whatsapp_business_account") return;
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    if (!value?.messages) return;
    const msg = value.messages[0];
    const phoneNumberId = value.metadata?.phone_number_id ?? "";
    const senderPhone = msg.from ?? "";
    const messageId = msg.id ?? "";
    const text2 = msg.text?.body ?? "";
    if (!text2.trim()) return;
    if (processedMessageIds.has(messageId)) {
      console.log(`[WhatsApp] Duplicate message ${messageId} \u2014 skipped`);
      return;
    }
    processedMessageIds.add(messageId);
    setTimeout(() => processedMessageIds.delete(messageId), 24 * 60 * 60 * 1e3);
    await handleIncomingMessage(senderPhone, text2, phoneNumberId);
  } catch (err) {
    console.error("[WhatsApp] Webhook processing error:", err);
  }
});
var processedMessageIds = /* @__PURE__ */ new Set();
async function handleIncomingMessage(senderPhone, text2, phoneNumberId) {
  console.log(`[WhatsApp] From ${senderPhone}: ${text2.substring(0, 80)}`);
  const conv = getOrCreateWAConv(senderPhone);
  try {
    const { reply, rawReply } = await callMannaBot(conv.messages, text2);
    conv.messages.push({ role: "user", content: text2 });
    conv.messages.push({ role: "assistant", content: reply });
    const { leadData } = extractLeadData(rawReply);
    if (leadData && !conv.leadCaptured) {
      conv.leadCaptured = true;
      const summary = `WhatsApp conversation with ${senderPhone}. Interest: ${leadData.interest ?? "General"}`;
      leadData.phone = senderPhone;
      await saveLeadToDb(leadData, summary, "whatsapp");
    }
    await sendWhatsAppMessage(phoneNumberId, senderPhone, reply);
    console.log(`[WhatsApp] Reply sent to ${senderPhone}`);
  } catch (err) {
    console.error(`[WhatsApp] Error handling message from ${senderPhone}:`, err);
    try {
      await sendWhatsAppMessage(
        phoneNumberId,
        senderPhone,
        "Thanks for reaching out! I'm having a brief moment \u2014 please try again or WhatsApp Mela: +27 73 406 1526 \u{1F60A}"
      );
    } catch {
    }
  }
}
async function sendWhatsAppMessage(phoneNumberId, to, body) {
  const token = ENV.whatsappAccessToken;
  if (!token) throw new Error("[WhatsApp] WHATSAPP_ACCESS_TOKEN not set");
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Meta API ${resp.status}: ${err}`);
  }
}
var whatsapp_webhook_default = router2;

// server/facebook-webhook.ts
import { Router as Router2 } from "express";
import crypto3 from "crypto";
var router3 = Router2();
function verifyMetaSignature2(rawBody, signature, appSecret) {
  if (!appSecret || !signature) return false;
  const [algo, hash] = signature.split("=");
  if (algo !== "sha256" || !hash) return false;
  const expected = crypto3.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  try {
    return crypto3.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}
router3.get("/webhook", (req, res) => {
  const verifyToken = ENV.facebookVerifyToken;
  if (!verifyToken) {
    console.error("[Facebook] FACEBOOK_VERIFY_TOKEN is not set");
    return res.status(500).send("Server misconfigured");
  }
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Facebook] Webhook verified");
    return res.status(200).send(challenge);
  }
  console.warn("[Facebook] Webhook verification failed \u2014 token mismatch");
  return res.status(403).send("Forbidden");
});
router3.post("/webhook", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const appSecret = ENV.facebookAppSecret;
  if (appSecret && req.rawBody) {
    if (!verifyMetaSignature2(req.rawBody, signature, appSecret)) {
      console.warn("[Facebook] Invalid HMAC signature \u2014 rejecting webhook");
      return res.status(403).send("Forbidden");
    }
  } else if (!appSecret) {
    console.warn("[Facebook] FACEBOOK_APP_SECRET not set \u2014 skipping signature check");
  }
  res.status(200).send("EVENT_RECEIVED");
  try {
    const body = req.body;
    if (body.object !== "page") {
      console.warn("[Facebook] Received non-page object:", body.object);
      return;
    }
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field === "leadgen") {
          await processLeadgenWebhook(change.value);
        }
      }
    }
  } catch (err) {
    console.error("[Facebook] Webhook processing error:", err);
  }
});
async function processLeadgenWebhook(webhookData) {
  const leadgenId = String(webhookData.leadgen_id);
  const existing = await getFacebookLeadByLeadgenId(leadgenId);
  if (existing) {
    console.log(`[Facebook] Lead ${leadgenId} already processed \u2014 skipped`);
    return;
  }
  let leadDetails = null;
  try {
    leadDetails = await fetchLeadFromGraphAPI(leadgenId);
  } catch (err) {
    console.error(`[Facebook] Failed to fetch lead ${leadgenId} from Graph API:`, err);
  }
  const fieldData = parseFieldData(leadDetails?.field_data ?? []);
  await createFacebookLead({
    leadgenId,
    formId: String(webhookData.form_id ?? ""),
    adId: String(webhookData.ad_id ?? ""),
    adgroupId: String(webhookData.adgroup_id ?? ""),
    pageId: String(webhookData.page_id ?? ""),
    fullName: fieldData.full_name ?? fieldData.name ?? null,
    email: fieldData.email ?? null,
    phone: fieldData.phone_number ?? fieldData.phone ?? null,
    city: fieldData.city ?? null,
    company: fieldData.company_name ?? fieldData.company ?? null,
    jobTitle: fieldData.job_title ?? null,
    rawFieldData: JSON.stringify(leadDetails?.field_data ?? []),
    status: "new",
    fbCreatedTime: webhookData.created_time ? new Date(webhookData.created_time * 1e3) : void 0
  });
  const leadName = fieldData.full_name ?? fieldData.name ?? "Facebook Lead";
  try {
    await createLead({
      name: leadName,
      email: fieldData.email ?? void 0,
      phone: fieldData.phone_number ?? fieldData.phone ?? void 0,
      businessName: fieldData.company_name ?? fieldData.company ?? "Unknown",
      businessType: fieldData.job_title ?? void 0,
      location: fieldData.city ?? void 0,
      status: "prospect",
      source: "facebook_ads",
      notes: `Auto-captured from Facebook Lead Ad. Form ID: ${webhookData.form_id}. Ad ID: ${webhookData.ad_id}.`
    });
    console.log(`[Facebook] Lead synced to CRM: ${leadName}`);
  } catch (err) {
    console.error("[Facebook] Error syncing lead to CRM:", err);
  }
  const phone = fieldData.phone_number ?? fieldData.phone;
  if (phone) {
    try {
      await sendWhatsAppFollowUp(phone, leadName);
    } catch (err) {
      console.error("[Facebook] WhatsApp follow-up failed:", err);
    }
  }
  try {
    await notifyOwner({
      title: `\u{1F525} New Facebook Lead: ${leadName}`,
      content: `Name: ${leadName}
Email: ${fieldData.email ?? "N/A"}
Phone: ${phone ?? "N/A"}
Company: ${fieldData.company_name ?? fieldData.company ?? "N/A"}`
    });
  } catch (err) {
    console.error("[Facebook] Owner notification failed:", err);
  }
  console.log(`[Facebook] Lead ${leadgenId} fully processed: ${leadName}`);
}
async function fetchLeadFromGraphAPI(leadgenId) {
  const accessToken = ENV.whatsappAccessToken;
  if (!accessToken) throw new Error("Meta access token not configured");
  const url = `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${accessToken}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Graph API ${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}
function parseFieldData(fieldData) {
  const result = {};
  for (const f of fieldData) {
    if (f.name && f.values?.length > 0) result[f.name] = f.values[0];
  }
  return result;
}
async function sendWhatsAppFollowUp(phoneNumber, leadName) {
  const accessToken = ENV.whatsappAccessToken;
  const phoneNumberId = ENV.whatsappPhoneNumberId;
  if (!accessToken || !phoneNumberId) {
    console.warn("[Facebook] WhatsApp credentials not configured for follow-up");
    return;
  }
  let clean = phoneNumber.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+")) clean = clean.slice(1);
  else if (clean.startsWith("0")) clean = "27" + clean.slice(1);
  const firstName = leadName.split(" ")[0] ?? "there";
  const message = `Hi ${firstName}! \u{1F44B}

Thanks for your interest in Manna Digital Hub!

We specialise in AI-powered WhatsApp automation that helps SA businesses respond to every customer 24/7 \u2014 even during load-shedding! \u26A1

Would you like to:
1\uFE0F\u20E3 Book a free discovery call
2\uFE0F\u20E3 See a live demo
3\uFE0F\u20E3 Get a custom quote

Reply 1, 2, or 3 and I'll get you sorted! \u{1F680}`;
  const resp = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: clean,
      type: "text",
      text: { body: message }
    })
  });
  if (!resp.ok) throw new Error(`WhatsApp API ${resp.status}: ${await resp.text()}`);
}
var facebook_webhook_default = router3;

// server/payfast-webhook.ts
import { Router as Router3 } from "express";
import crypto4 from "crypto";
var router4 = Router3();
var PAYFAST_IPS = /* @__PURE__ */ new Set([
  "41.74.179.194",
  "41.74.179.196",
  "41.74.179.197",
  "41.74.179.198",
  "41.74.179.199",
  "197.97.145.144",
  "197.97.145.145",
  "197.97.145.146",
  // Sandbox IPs (only active when PAYFAST_SANDBOX=true)
  "127.0.0.1",
  "::1"
]);
var PLAN_AMOUNTS = {
  "WhatsApp Starter": 800,
  "AI Complete Bundle": 2500,
  "AI Chatbot Only": 1200,
  "Social Media Manager": 1500
};
function buildSignature(params, passphrase) {
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.filter((k) => k !== "signature" && params[k] !== "").map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`).join("&");
  const withPassphrase = passphrase ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}` : queryString;
  return crypto4.createHash("md5").update(withPassphrase).digest("hex");
}
router4.post("/notify", async (req, res) => {
  res.status(200).send("OK");
  try {
    await processItn(req);
  } catch (err) {
    console.error("[PayFast] ITN processing error:", err);
  }
});
async function processItn(req) {
  const params = req.body;
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? req.ip ?? "";
  if (!ENV.payfastSandbox && !PAYFAST_IPS.has(clientIp)) {
    console.warn(`[PayFast] ITN from unlisted IP ${clientIp} \u2014 rejected`);
    return;
  }
  const receivedSig = params.signature ?? "";
  const expectedSig = buildSignature(params, ENV.payfastPassphrase);
  let sigValid = false;
  try {
    sigValid = crypto4.timingSafeEqual(
      Buffer.from(expectedSig, "hex"),
      Buffer.from(receivedSig, "hex")
    );
  } catch {
    sigValid = false;
  }
  if (!sigValid) {
    console.warn("[PayFast] ITN signature mismatch \u2014 rejected");
    console.warn("[PayFast] Expected:", expectedSig, "| Received:", receivedSig);
    return;
  }
  const itemName = params.item_name ?? "";
  const receivedAmount = parseFloat(params.amount_gross ?? "0");
  const expectedAmount = PLAN_AMOUNTS[itemName];
  if (expectedAmount === void 0) {
    console.warn(`[PayFast] Unknown plan item_name: "${itemName}" \u2014 rejected`);
    return;
  }
  if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
    console.warn(
      `[PayFast] Amount mismatch for "${itemName}": expected R${expectedAmount}, got R${receivedAmount} \u2014 rejected`
    );
    await notifyOwner({
      title: "\u26A0\uFE0F PayFast Amount Mismatch",
      content: `item_name: ${itemName}
Expected: R${expectedAmount}
Received: R${receivedAmount}
pf_payment_id: ${params.pf_payment_id}`
    });
    return;
  }
  const payfastPaymentId = params.pf_payment_id ?? "";
  const isNew = await createPaymentIfNew({
    payfastPaymentId,
    amount: receivedAmount,
    itemName,
    paymentStatus: params.payment_status ?? "UNKNOWN",
    signatureValid: sigValid ? 1 : 0,
    rawItn: JSON.stringify(params),
    merchantPaymentId: params.m_payment_id ?? null
  });
  if (!isNew) {
    console.log(`[PayFast] Duplicate ITN for ${payfastPaymentId} \u2014 skipped`);
    return;
  }
  const paymentStatus = params.payment_status;
  const merchantPaymentId = params.m_payment_id ?? "";
  if (paymentStatus === "COMPLETE") {
    console.log(`[PayFast] \u2705 Payment COMPLETE: ${payfastPaymentId} | ${itemName} | R${receivedAmount}`);
    if (merchantPaymentId) {
      try {
        await updateClientPaymentStatus(merchantPaymentId, "current");
      } catch (err) {
        console.error("[PayFast] Failed to update client status:", err);
      }
    }
    await notifyOwner({
      title: `\u{1F4B0} Payment Received: R${receivedAmount}`,
      content: `Plan: ${itemName}
Payer: ${params.name_first ?? ""} ${params.name_last ?? ""} (${params.email_address ?? ""})
Payment ID: ${payfastPaymentId}
Merchant ref: ${merchantPaymentId}`
    });
  } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
    console.warn(`[PayFast] \u274C Payment ${paymentStatus}: ${payfastPaymentId}`);
    if (merchantPaymentId) {
      try {
        await updateClientPaymentStatus(
          merchantPaymentId,
          paymentStatus === "CANCELLED" ? "pending" : "overdue"
        );
      } catch (err) {
        console.error("[PayFast] Failed to update client status after failure:", err);
      }
    }
    await notifyOwner({
      title: `\u26A0\uFE0F Payment ${paymentStatus}: ${itemName}`,
      content: `Plan: ${itemName}
Payer: ${params.name_first ?? ""} ${params.name_last ?? ""}
Email: ${params.email_address ?? ""}
Payment ID: ${payfastPaymentId}`
    });
  } else {
    console.log(`[PayFast] Payment status: ${paymentStatus} (no action)`);
  }
}
var payfast_webhook_default = router4;

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(start = 3e3) {
  for (let port = start; port < start + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port starting from ${start}`);
}
var chatRateLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute window
  max: 20,
  // 20 messages per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests \u2014 please wait a moment." },
  skip: () => process.env.NODE_ENV !== "production"
});
var apiRateLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== "production"
});
var webhookRateLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(
    express2.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app.use(
    express2.urlencoded({
      limit: "50mb",
      extended: true,
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version ?? "1.0.0",
      env: process.env.NODE_ENV ?? "development"
    });
  });
  registerOAuthRoutes(app);
  app.use("/api/whatsapp", webhookRateLimiter, whatsapp_webhook_default);
  app.use("/api/facebook", webhookRateLimiter, facebook_webhook_default);
  app.use("/api/payfast", webhookRateLimiter, payfast_webhook_default);
  app.get("/api/payfast/return", (_req, res) => {
    res.redirect("/thank-you");
  });
  app.get("/api/payfast/cancel", (_req, res) => {
    res.redirect("/pricing?cancelled=true");
  });
  app.use(
    "/api/trpc/aiChat",
    chatRateLimiter,
    createExpressMiddleware({ router: appRouter, createContext })
  );
  app.use(
    "/api/trpc",
    apiRateLimiter,
    createExpressMiddleware({ router: appRouter, createContext })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  app.use((err, _req, res, _next) => {
    console.error("[Server] Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  });
  const preferredPort = parseInt(process.env.PORT ?? "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} busy, using ${port}`);
  }
  server.listen(port, () => {
    console.log(`
\u{1F680} Manna Agency Hub running on http://localhost:${port}/`);
    console.log(`   Environment : ${process.env.NODE_ENV ?? "development"}`);
    console.log(`   Health check: http://localhost:${port}/api/health
`);
  });
}
startServer().catch(console.error);
