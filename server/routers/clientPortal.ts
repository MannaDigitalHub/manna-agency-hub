/**
 * Client portal data — row-level security enforced on every query.
 * Clients can only ever read their OWN data.
 */
import { eq } from "drizzle-orm";
import { clientProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { clients, projects, invoices, subscriptions } from "../../drizzle/schema";

export const clientPortalRouter = router({

  /** My company info + contract status */
  getMyInfo: clientProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select({
      businessName: clients.businessName,
      businessType: clients.businessType,
      contactName: clients.contactName,
      status: clients.status,
      paymentStatus: clients.paymentStatus,
      monthlyRetainer: clients.monthlyRetainer,
      contractStartDate: clients.contractStartDate,
      nextBillingDate: clients.nextBillingDate,
    }).from(clients).where(eq(clients.id, ctx.client.id)).limit(1);
    return rows[0] ?? null;
  }),

  /** My active projects */
  getMyProjects: clientProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select({
      id: projects.id,
      projectName: projects.projectName,
      botName: projects.botName,
      whatsappNumber: projects.whatsappNumber,
      status: projects.status,
      goLiveDate: projects.goLiveDate,
      services: projects.services,
    }).from(projects).where(eq(projects.clientId, ctx.client.id));
  }),

  /** My invoices */
  getMyInvoices: clientProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      invoiceType: invoices.invoiceType,
      amount: invoices.amount,
      description: invoices.description,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidDate: invoices.paidDate,
      status: invoices.status,
    }).from(invoices).where(eq(invoices.clientId, ctx.client.id))
      .orderBy(invoices.issueDate);
  }),

  /**
   * POPIA/GDPR — Right of Access.
   * Returns all personal data we hold about this client as a structured object.
   */
  exportMyData: clientProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return {};
    const [clientData, myProjects, myInvoices, mySub] = await Promise.all([
      db.select().from(clients).where(eq(clients.id, ctx.client.id)).limit(1),
      db.select().from(projects).where(eq(projects.clientId, ctx.client.id)),
      db.select().from(invoices).where(eq(invoices.clientId, ctx.client.id)),
      db.select().from(subscriptions).where(eq(subscriptions.clientId, ctx.client.id)).limit(1),
    ]);

    const safe = clientData[0] ? {
      businessName: clientData[0].businessName,
      contactName: clientData[0].contactName,
      contactEmail: clientData[0].contactEmail,
      contactPhone: clientData[0].contactPhone,
      location: clientData[0].location,
      consentGivenAt: clientData[0].consentGivenAt,
      consentVersion: clientData[0].consentVersion,
      lastLoginAt: clientData[0].lastLoginAt,
      createdAt: clientData[0].createdAt,
      // Omit: passwordHash, tokens, IP addresses (security)
    } : {};

    return {
      exportDate: new Date().toISOString(),
      responsibleParty: "K2026183802 (SA) (PTY) LTD T/A Manna Digital Hub",
      profile: safe,
      projects: myProjects,
      invoices: myInvoices,
      subscription: mySub[0] ?? null,
    };
  }),

  /**
   * POPIA/GDPR — Right to Erasure.
   * Flags account for deletion review. Actual deletion is manual to prevent abuse.
   */
  requestDeletion: clientProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (db) {
      await db.insert(require("../../drizzle/schema").auditLog).values({
        eventType: "deletion_requested",
        clientId: ctx.client.id,
        metadata: JSON.stringify({ email: ctx.client.contactEmail }),
      }).catch(() => {});
    }
    // Log to console so admin sees it immediately
    console.warn(`[POPIA] Deletion requested by clientId=${ctx.client.id} email=${ctx.client.contactEmail}`);
    return { success: true, message: "Your deletion request has been received. We will process it within 30 days as required by POPIA." } as const;
  }),
});
