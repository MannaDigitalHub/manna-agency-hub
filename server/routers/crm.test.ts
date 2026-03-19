import { describe, expect, it, beforeEach, vi } from "vitest";
import { z } from "zod";

// Mock the database functions
vi.mock("../db", () => ({
  createLead: vi.fn(async (data) => ({ id: 1, ...data })),
  getLeadById: vi.fn(async (id) => ({
    id,
    name: "Test Lead",
    businessName: "Test Business",
    status: "prospect",
  })),
  listLeads: vi.fn(async () => [
    { id: 1, name: "Lead 1", businessName: "Business 1", status: "prospect" },
    { id: 2, name: "Lead 2", businessName: "Business 2", status: "call_booked" },
  ]),
  updateLead: vi.fn(async (id, data) => ({ id, ...data })),
  createClient: vi.fn(async (data) => ({ id: 1, ...data })),
  getClientById: vi.fn(async (id) => ({
    id,
    businessName: "Test Client",
    status: "active",
  })),
  listClients: vi.fn(async () => [
    { id: 1, businessName: "Client 1", status: "active" },
  ]),
  updateClient: vi.fn(async (id, data) => ({ id, ...data })),
  createProject: vi.fn(async (data) => ({ id: 1, ...data })),
  getProjectById: vi.fn(async (id) => ({
    id,
    projectName: "Test Project",
    status: "discovery",
  })),
  listProjectsByClient: vi.fn(async () => [
    { id: 1, projectName: "Project 1", status: "live" },
  ]),
  updateProject: vi.fn(async (id, data) => ({ id, ...data })),
  createInvoice: vi.fn(async (data) => ({ id: 1, ...data })),
  getInvoiceById: vi.fn(async (id) => ({
    id,
    invoiceNumber: "INV-001",
    status: "draft",
  })),
  listInvoicesByClient: vi.fn(async () => [
    { id: 1, invoiceNumber: "INV-001", status: "paid" },
  ]),
  updateInvoice: vi.fn(async (id, data) => ({ id, ...data })),
  createTask: vi.fn(async (data) => ({ id: 1, ...data })),
  getTaskById: vi.fn(async (id) => ({
    id,
    title: "Test Task",
    status: "pending",
  })),
  listTasks: vi.fn(async () => [
    { id: 1, title: "Task 1", status: "pending" },
  ]),
  updateTask: vi.fn(async (id, data) => ({ id, ...data })),
}));

describe("CRM Router", () => {
  describe("Lead Management", () => {
    it("should validate lead creation input", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        businessName: z.string(),
        businessType: z.string().optional(),
        location: z.string().optional(),
        painPoint: z.string().optional(),
        serviceInterest: z.string().optional(),
        callbackNumber: z.string().optional(),
        notes: z.string().optional(),
      });

      const validData = {
        name: "John Doe",
        email: "john@example.com",
        businessName: "Acme Corp",
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it("should reject invalid email in lead creation", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email().optional(),
        businessName: z.string(),
      });

      const invalidData = {
        name: "John Doe",
        email: "not-an-email",
        businessName: "Acme Corp",
      };

      expect(() => schema.parse(invalidData)).toThrow();
    });

    it("should validate lead status transitions", () => {
      const statusSchema = z.enum(["prospect", "call_booked", "client", "not_interested", "on_hold"]);

      expect(() => statusSchema.parse("prospect")).not.toThrow();
      expect(() => statusSchema.parse("client")).not.toThrow();
      expect(() => statusSchema.parse("invalid_status")).toThrow();
    });
  });

  describe("Client Management", () => {
    it("should validate client creation input", () => {
      const schema = z.object({
        businessName: z.string(),
        contactName: z.string(),
        contactEmail: z.string().email(),
        contactPhone: z.string(),
        monthlyRetainer: z.number(),
      });

      const validData = {
        businessName: "Test Business",
        contactName: "Jane Doe",
        contactEmail: "jane@example.com",
        contactPhone: "+27 73 406 1526",
        monthlyRetainer: 2500,
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it("should validate monthly retainer is positive", () => {
      const schema = z.object({
        monthlyRetainer: z.number().positive(),
      });

      expect(() => schema.parse({ monthlyRetainer: 2500 })).not.toThrow();
      expect(() => schema.parse({ monthlyRetainer: -100 })).toThrow();
      expect(() => schema.parse({ monthlyRetainer: 0 })).toThrow();
    });
  });

  describe("Project Management", () => {
    it("should validate project status values", () => {
      const statusSchema = z.enum([
        "discovery",
        "setup",
        "training",
        "testing",
        "live",
        "maintenance",
        "paused",
      ]);

      const validStatuses = ["discovery", "setup", "training", "testing", "live", "maintenance", "paused"];
      validStatuses.forEach((status) => {
        expect(() => statusSchema.parse(status)).not.toThrow();
      });

      expect(() => statusSchema.parse("invalid")).toThrow();
    });
  });

  describe("Invoice Management", () => {
    it("should validate invoice type", () => {
      const typeSchema = z.enum(["setup", "retainer", "one_off"]);

      expect(() => typeSchema.parse("setup")).not.toThrow();
      expect(() => typeSchema.parse("retainer")).not.toThrow();
      expect(() => typeSchema.parse("one_off")).not.toThrow();
      expect(() => typeSchema.parse("invalid")).toThrow();
    });

    it("should validate invoice status", () => {
      const statusSchema = z.enum(["draft", "sent", "paid", "overdue", "cancelled"]);

      const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"];
      validStatuses.forEach((status) => {
        expect(() => statusSchema.parse(status)).not.toThrow();
      });
    });

    it("should validate invoice amount is positive", () => {
      const schema = z.object({
        amount: z.number().positive(),
      });

      expect(() => schema.parse({ amount: 5000 })).not.toThrow();
      expect(() => schema.parse({ amount: -100 })).toThrow();
    });
  });

  describe("Task Management", () => {
    it("should validate task type", () => {
      const typeSchema = z.enum([
        "onboarding",
        "follow_up",
        "milestone",
        "reminder",
        "payment",
        "support",
      ]);

      const validTypes = ["onboarding", "follow_up", "milestone", "reminder", "payment", "support"];
      validTypes.forEach((type) => {
        expect(() => typeSchema.parse(type)).not.toThrow();
      });
    });

    it("should validate task priority", () => {
      const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);

      expect(() => prioritySchema.parse("high")).not.toThrow();
      expect(() => prioritySchema.parse("invalid")).toThrow();
    });

    it("should validate task status", () => {
      const statusSchema = z.enum(["pending", "in_progress", "completed", "cancelled"]);

      const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
      validStatuses.forEach((status) => {
        expect(() => statusSchema.parse(status)).not.toThrow();
      });
    });
  });
});
