import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { clients, leads, invoices, projects } from "../../drizzle/schema";
import { eq, gte, lte } from "drizzle-orm";

export const analyticsRouter = router({
  // Dashboard metrics
  dashboardMetrics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get active clients count
    const activeClientsResult = await db
      .select()
      .from(clients)
      .where(eq(clients.status, "active"));
    const activeClientsCount = activeClientsResult.length;

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    for (const client of activeClientsResult) {
      const amount = typeof client.monthlyRetainer === "string" 
        ? parseFloat(client.monthlyRetainer) 
        : client.monthlyRetainer;
      mrr += amount;
    }

    // Get total leads
    const leadsResult = await db.select().from(leads);
    const totalLeads = leadsResult.length;

    // Get conversion rate
    const clientsFromLeads = leadsResult.filter(
      (l) => l.status === "client"
    ).length;
    const conversionRate =
      totalLeads > 0 ? Math.round((clientsFromLeads / totalLeads) * 100) : 0;

    // Get live projects
    const liveProjectsResult = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "live"));
    const liveProjectsCount = liveProjectsResult.length;

    return {
      activeClients: activeClientsCount,
      mrr: Math.round(mrr * 100) / 100,
      totalLeads,
      conversionRate,
      liveProjects: liveProjectsCount,
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
      notInterested: leadsData.filter((l) => l.status === "not_interested")
        .length,
    };

    return pipeline;
  }),

  // Revenue analytics
  revenueAnalytics: protectedProcedure
    .input(z.object({ months: z.number().default(6) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoicesData = await db.select().from(invoices);
      const monthlyRevenue: Record<string, number> = {};

      // Group invoices by month
      invoicesData.forEach((invoice) => {
        if (invoice.status === "paid") {
          const date = invoice.paidDate || invoice.issueDate;
          const monthKey = date
            ? new Date(date).toISOString().slice(0, 7)
            : "unknown";
          const amount = typeof invoice.amount === "string" 
            ? parseFloat(invoice.amount) 
            : invoice.amount;
          monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount;
        }
      });

      return monthlyRevenue;
    }),

  // Client lifetime value
  clientLifetimeValue: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const client = await db
        .select()
        .from(clients)
        .where(eq(clients.id, input.clientId))
        .limit(1);

      if (!client.length) throw new Error("Client not found");

      const clientData = client[0];
      const invoicesData = await db
        .select()
        .from(invoices)
        .where(eq(invoices.clientId, input.clientId));

      let totalPaid = 0;
      invoicesData.forEach((inv) => {
        if (inv.status === "paid") {
          const amount = typeof inv.amount === "string" 
            ? parseFloat(inv.amount) 
            : inv.amount;
          totalPaid += amount;
        }
      });

      // Calculate projected LTV (assuming client stays for 12 months)
      const monthlyRetainer = typeof clientData.monthlyRetainer === "string" 
        ? parseFloat(clientData.monthlyRetainer) 
        : clientData.monthlyRetainer;
      const projectedLTV = monthlyRetainer * 12;

      return {
        totalPaid: Math.round(totalPaid * 100) / 100,
        projectedLTV: Math.round(projectedLTV * 100) / 100,
        monthlyRetainer: Math.round(monthlyRetainer * 100) / 100,
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
      maintenance: projectsData.filter((p) => p.status === "maintenance")
        .length,
      paused: projectsData.filter((p) => p.status === "paused").length,
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
      pending: clientsData.filter((c) => c.paymentStatus === "pending").length,
    };

    return overview;
  }),
});
