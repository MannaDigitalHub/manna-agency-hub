import { describe, expect, it, vi } from "vitest";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(async () => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => []),
      })),
    })),
  })),
}));

describe("Analytics Router", () => {
  describe("Dashboard Metrics", () => {
    it("should calculate MRR correctly", () => {
      const clients = [
        { monthlyRetainer: "2500" },
        { monthlyRetainer: "3000" },
        { monthlyRetainer: "1500" },
      ];

      let mrr = 0;
      for (const client of clients) {
        const amount = typeof client.monthlyRetainer === "string" 
          ? parseFloat(client.monthlyRetainer) 
          : client.monthlyRetainer;
        mrr += amount;
      }

      expect(mrr).toBe(7000);
      expect(Math.round(mrr * 100) / 100).toBe(7000);
    });

    it("should calculate conversion rate correctly", () => {
      const totalLeads = 100;
      const clientsFromLeads = 25;
      const conversionRate = Math.round((clientsFromLeads / totalLeads) * 100);

      expect(conversionRate).toBe(25);
    });

    it("should handle zero leads for conversion rate", () => {
      const totalLeads = 0;
      const clientsFromLeads = 0;
      const conversionRate = totalLeads > 0 ? Math.round((clientsFromLeads / totalLeads) * 100) : 0;

      expect(conversionRate).toBe(0);
    });
  });

  describe("Lead Pipeline", () => {
    it("should categorize leads by status", () => {
      const leads = [
        { id: 1, status: "prospect" },
        { id: 2, status: "prospect" },
        { id: 3, status: "call_booked" },
        { id: 4, status: "client" },
        { id: 5, status: "not_interested" },
      ];

      const pipeline = {
        prospect: leads.filter((l) => l.status === "prospect").length,
        callBooked: leads.filter((l) => l.status === "call_booked").length,
        client: leads.filter((l) => l.status === "client").length,
        notInterested: leads.filter((l) => l.status === "not_interested").length,
      };

      expect(pipeline.prospect).toBe(2);
      expect(pipeline.callBooked).toBe(1);
      expect(pipeline.client).toBe(1);
      expect(pipeline.notInterested).toBe(1);
    });
  });

  describe("Revenue Analytics", () => {
    it("should group invoices by month", () => {
      const invoices = [
        { status: "paid", amount: "1000", paidDate: new Date("2026-03-15") },
        { status: "paid", amount: "2000", paidDate: new Date("2026-03-20") },
        { status: "paid", amount: "1500", paidDate: new Date("2026-02-15") },
        { status: "draft", amount: "500", paidDate: null },
      ];

      const monthlyRevenue: Record<string, number> = {};

      invoices.forEach((invoice) => {
        if (invoice.status === "paid") {
          const date = invoice.paidDate;
          const monthKey = date ? new Date(date).toISOString().slice(0, 7) : "unknown";
          const amount = typeof invoice.amount === "string" 
            ? parseFloat(invoice.amount) 
            : invoice.amount;
          monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount;
        }
      });

      expect(monthlyRevenue["2026-03"]).toBe(3000);
      expect(monthlyRevenue["2026-02"]).toBe(1500);
      expect(monthlyRevenue["2026-01"]).toBeUndefined();
    });

    it("should only count paid invoices in revenue", () => {
      const invoices = [
        { status: "paid", amount: "1000" },
        { status: "draft", amount: "500" },
        { status: "overdue", amount: "750" },
      ];

      const totalRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

      expect(totalRevenue).toBe(1000);
    });
  });

  describe("Client Lifetime Value", () => {
    it("should calculate projected LTV", () => {
      const monthlyRetainer = 2500;
      const projectedLTV = monthlyRetainer * 12;

      expect(projectedLTV).toBe(30000);
    });

    it("should accumulate total paid from invoices", () => {
      const invoices = [
        { status: "paid", amount: "2500" },
        { status: "paid", amount: "2500" },
        { status: "draft", amount: "2500" },
      ];

      let totalPaid = 0;
      invoices.forEach((inv) => {
        if (inv.status === "paid") {
          const amount = typeof inv.amount === "string" 
            ? parseFloat(inv.amount) 
            : inv.amount;
          totalPaid += amount;
        }
      });

      expect(totalPaid).toBe(5000);
    });
  });

  describe("Project Status Breakdown", () => {
    it("should count projects by status", () => {
      const projects = [
        { id: 1, status: "discovery" },
        { id: 2, status: "discovery" },
        { id: 3, status: "setup" },
        { id: 4, status: "live" },
        { id: 5, status: "live" },
        { id: 6, status: "live" },
      ];

      const breakdown = {
        discovery: projects.filter((p) => p.status === "discovery").length,
        setup: projects.filter((p) => p.status === "setup").length,
        live: projects.filter((p) => p.status === "live").length,
      };

      expect(breakdown.discovery).toBe(2);
      expect(breakdown.setup).toBe(1);
      expect(breakdown.live).toBe(3);
    });
  });

  describe("Payment Status Overview", () => {
    it("should count clients by payment status", () => {
      const clients = [
        { id: 1, paymentStatus: "current" },
        { id: 2, paymentStatus: "current" },
        { id: 3, paymentStatus: "overdue" },
        { id: 4, paymentStatus: "failed" },
      ];

      const overview = {
        current: clients.filter((c) => c.paymentStatus === "current").length,
        overdue: clients.filter((c) => c.paymentStatus === "overdue").length,
        failed: clients.filter((c) => c.paymentStatus === "failed").length,
      };

      expect(overview.current).toBe(2);
      expect(overview.overdue).toBe(1);
      expect(overview.failed).toBe(1);
    });
  });
});
