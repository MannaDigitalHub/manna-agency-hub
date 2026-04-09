import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// LEADS TABLE — Apollo outreach tracking
// ============================================================
export const leads = mysqlTable("leads", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ============================================================
// CLIENTS TABLE — Paying customers
// ============================================================
export const clients = mysqlTable("clients", {
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
  // ── Portal auth ──────────────────────────────────────────────
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  inviteToken: varchar("inviteToken", { length: 128 }).unique(),
  inviteTokenExpiry: timestamp("inviteTokenExpiry"),
  passwordResetToken: varchar("passwordResetToken", { length: 128 }).unique(),
  passwordResetExpiry: timestamp("passwordResetExpiry"),
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  lockoutUntil: timestamp("lockoutUntil"),
  // ── POPIA / GDPR consent ─────────────────────────────────────
  consentGivenAt: timestamp("consentGivenAt"),
  consentVersion: varchar("consentVersion", { length: 20 }),
  // ── Security audit ───────────────────────────────────────────
  lastLoginAt: timestamp("lastLoginAt"),
  lastLoginIp: varchar("lastLoginIp", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ============================================================
// PROJECTS TABLE — Bot deployment tracking
// ============================================================
export const projects = mysqlTable("projects", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ============================================================
// INVOICES TABLE — Payment tracking
// ============================================================
export const invoices = mysqlTable("invoices", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================================
// BOT_CONNECTIONS TABLE — WhatChimp integration
// ============================================================
export const botConnections = mysqlTable("bot_connections", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BotConnection = typeof botConnections.$inferSelect;
export type InsertBotConnection = typeof botConnections.$inferInsert;

// ============================================================
// TASKS TABLE — Workflow automation
// ============================================================
export const tasks = mysqlTable("tasks", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ============================================================
// BOT_LEADS TABLE — Leads captured by Manna Bot (website + WhatsApp)
// ============================================================
export const botLeads = mysqlTable("bot_leads", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BotLead = typeof botLeads.$inferSelect;
export type InsertBotLead = typeof botLeads.$inferInsert;

// ============================================================
// FACEBOOK_LEADS TABLE — Leads from Facebook Lead Ads
// ============================================================
export const facebookLeads = mysqlTable("facebook_leads", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FacebookLead = typeof facebookLeads.$inferSelect;
export type InsertFacebookLead = typeof facebookLeads.$inferInsert;

// ============================================================
// PAYMENTS TABLE — Immutable PayFast ITN audit log
// One row per ITN event. Never updated after insert.
// ============================================================
export const payments = mysqlTable("payments", {
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
  processedAt: timestamp("processedAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============================================================
// SUBSCRIPTIONS TABLE — PayFast recurring billing state
// ============================================================
export const subscriptions = mysqlTable("subscriptions", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ============================================================
// AUDIT_LOG — POPIA/GDPR immutable security event trail
// ============================================================
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  clientId: int("clientId"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 512 }),
  metadata: text("metadata"), // JSON string — never store passwords or tokens
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;