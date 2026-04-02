import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { desc } from "drizzle-orm";
import {
  InsertUser, users,
  InsertLead, leads,
  InsertClient, clients,
  InsertProject, projects,
  InsertInvoice, invoices,
  InsertTask, tasks,
  InsertBotConnection, botConnections,
  InsertBotLead, botLeads,
  InsertFacebookLead, facebookLeads,
  InsertPayment, payments,
  InsertSubscription, subscriptions,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// LEADS QUERIES
// ============================================================
export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(data);
  return result;
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

export async function listLeads(filters?: { status?: string; source?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query: any = db.select().from(leads);
  if (filters?.status) {
    query = query.where(eq(leads.status, filters.status as any));
  }
  return query;
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set(data).where(eq(leads.id, id));
  return getLeadById(id);
}

// ============================================================
// CLIENTS QUERIES
// ============================================================
export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return result;
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function listClients(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query: any = db.select().from(clients);
  if (filters?.status) {
    query = query.where(eq(clients.status, filters.status as any));
  }
  return query;
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
  return getClientById(id);
}

// ============================================================
// PROJECTS QUERIES
// ============================================================
export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return result;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function listProjectsByClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(projects).where(eq(projects.clientId, clientId));
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
  return getProjectById(id);
}

// ============================================================
// INVOICES QUERIES
// ============================================================
export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoices).values(data);
  return result;
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0];
}

export async function listInvoicesByClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(invoices).where(eq(invoices.clientId, clientId));
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
  return getInvoiceById(id);
}

// ============================================================
// TASKS QUERIES
// ============================================================
export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  return result;
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0];
}

export async function listTasks(filters?: { status?: string; clientId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query: any = db.select().from(tasks);
  if (filters?.status) {
    query = query.where(eq(tasks.status, filters.status as any));
  }
  return query;
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return getTaskById(id);
}

// ============================================================
// BOT LEADS QUERIES
// ============================================================
export async function createBotLead(data: InsertBotLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(botLeads).values(data);
  return result;
}

export async function listBotLeads() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(botLeads).orderBy(desc(botLeads.createdAt));
}

export async function updateBotLead(id: number, data: Partial<InsertBotLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(botLeads).set(data).where(eq(botLeads.id, id));
  const result = await db.select().from(botLeads).where(eq(botLeads.id, id)).limit(1);
  return result[0];
}

// ============================================================
// FACEBOOK LEADS QUERIES
// ============================================================
export async function createFacebookLead(data: InsertFacebookLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(facebookLeads).values(data);
  return result;
}

export async function getFacebookLeadByLeadgenId(leadgenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(facebookLeads).where(eq(facebookLeads.leadgenId, leadgenId)).limit(1);
  return result[0];
}

export async function listFacebookLeads(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query: any = db.select().from(facebookLeads).orderBy(desc(facebookLeads.createdAt));
  if (filters?.status) {
    query = db.select().from(facebookLeads).where(eq(facebookLeads.status, filters.status as any)).orderBy(desc(facebookLeads.createdAt));
  }
  return query;
}

export async function updateFacebookLead(id: number, data: Partial<InsertFacebookLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(facebookLeads).set(data).where(eq(facebookLeads.id, id));
  const result = await db.select().from(facebookLeads).where(eq(facebookLeads.id, id)).limit(1);
  return result[0];
}

export async function syncFacebookLeadToCRM(fbLeadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const fbLead = await db.select().from(facebookLeads).where(eq(facebookLeads.id, fbLeadId)).limit(1);
  if (!fbLead[0]) throw new Error("Facebook lead not found");
  const fl = fbLead[0];
  // Create a CRM lead from the Facebook lead
  const crmLead: InsertLead = {
    name: fl.fullName || "Facebook Lead",
    email: fl.email,
    phone: fl.phone,
    businessName: fl.company || "Unknown",
    businessType: fl.jobTitle || undefined,
    location: fl.city || undefined,
    status: "prospect",
    source: "facebook_ads",
    notes: `From Facebook Lead Ad. Form: ${fl.formName || fl.formId}. Ad: ${fl.adName || fl.adId}. Campaign: ${fl.campaignName || "N/A"}.`,
  };
  const result = await db.insert(leads).values(crmLead);
  const insertId = (result as any)[0]?.insertId;
  // Update the FB lead with the CRM lead ID
  await db.update(facebookLeads).set({ status: "synced_to_crm", crmLeadId: insertId }).where(eq(facebookLeads.id, fbLeadId));
  return insertId;
}

// ============================================================
// PAYMENTS QUERIES — Idempotent PayFast ITN records
// ============================================================

export interface CreatePaymentArgs {
  payfastPaymentId: string;
  merchantPaymentId?: string | null;
  amount: number;
  itemName?: string | null;
  paymentStatus: string;
  signatureValid: number;
  rawItn: string;
}

/**
 * Insert a payment row ONLY if the payfastPaymentId has not been seen before.
 * Returns true if a new row was inserted, false if it was a duplicate.
 */
export async function createPaymentIfNew(data: CreatePaymentArgs): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create payment: database not available");
    return false;
  }
  try {
    await (db as any).execute(
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
        data.rawItn,
      ],
    );
    // affectedRows === 0 means duplicate (INSERT IGNORE skipped it)
    const [[{ affectedRows }]] = await (db as any).execute(
      'SELECT ROW_COUNT() AS affectedRows'
    );
    return Number(affectedRows) > 0;
  } catch (err: any) {
    // Duplicate key on unique constraint — not a new payment
    if (err?.code === 'ER_DUP_ENTRY') return false;
    throw err;
  }
}

// ============================================================
// CLIENT PAYMENT STATUS — updated after successful PayFast ITN
// ============================================================

/**
 * Find a client by merchantPaymentId and update their paymentStatus.
 * merchantPaymentId is set when creating the PayFast subscription form
 * and is echoed back in the ITN as m_payment_id.
 */
export async function updateClientPaymentStatus(
  merchantPaymentId: string,
  paymentStatus: 'current' | 'overdue' | 'failed' | 'pending',
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await (db as any).execute(
    `UPDATE clients SET paymentStatus = ?, updatedAt = NOW() WHERE merchantPaymentId = ?`,
    [paymentStatus, merchantPaymentId],
  );
}

// ============================================================
// SUBSCRIPTIONS QUERIES
// ============================================================
export async function upsertSubscription(data: InsertSubscription): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(subscriptions)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        payfastToken: data.payfastToken,
        payfastSubscriptionId: data.payfastSubscriptionId,
        status: data.status,
        amount: data.amount,
        nextRunDate: data.nextRunDate,
      },
    });
}

export async function getSubscriptionByClientId(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.clientId, clientId))
    .limit(1);
  return result[0];
}
