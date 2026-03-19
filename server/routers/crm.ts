import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createLead,
  getLeadById,
  listLeads,
  updateLead,
  createClient,
  getClientById,
  listClients,
  updateClient,
  createProject,
  getProjectById,
  listProjectsByClient,
  updateProject,
  createInvoice,
  getInvoiceById,
  listInvoicesByClient,
  updateInvoice,
  createTask,
  getTaskById,
  listTasks,
  updateTask,
} from "../db";

export const crmRouter = router({
  // ============================================================
  // LEADS
  // ============================================================
  leads: router({
    create: protectedProcedure
      .input(
        z.object({
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
        })
      )
      .mutation(async ({ input }) => {
        return createLead({
          ...input,
          status: "prospect",
          outreachDate: new Date(),
        });
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLeadById(input.id);
      }),

    list: protectedProcedure
      .input(
        z.object({
          status: z.string().optional(),
          source: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const query = await listLeads(input);
        return query;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z
            .enum(["prospect", "call_booked", "client", "not_interested", "on_hold"])
            .optional(),
          notes: z.string().optional(),
          lastFollowUp: z.date().optional(),
          nextFollowUp: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateLead(id, data);
      }),

    convertToClient: protectedProcedure
      .input(
        z.object({
          leadId: z.number(),
          monthlyRetainer: z.number(),
          setupFee: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const lead = await getLeadById(input.leadId);
        if (!lead) throw new Error("Lead not found");

        const client = await createClient({
          leadId: input.leadId,
          businessName: lead.businessName,
          businessType: lead.businessType || undefined,
          contactName: lead.name,
          contactEmail: lead.email || "",
          contactPhone: lead.callbackNumber || lead.phone || "",
          location: lead.location || undefined,
          monthlyRetainer: input.monthlyRetainer.toString() as any,
          setupFee: input.setupFee ? input.setupFee.toString() : undefined,
          status: "trial",
          contractStartDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        await updateLead(input.leadId, { status: "client" });
        return client;
      }),
  }),

  // ============================================================
  // CLIENTS
  // ============================================================
  clients: router({
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getClientById(input.id);
      }),

    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        const query = await listClients(input);
        return query;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          monthlyRetainer: z.number().optional(),
          status: z.enum(["active", "paused", "cancelled", "trial"]).optional(),
          paymentStatus: z
            .enum(["current", "overdue", "failed", "pending"])
            .optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.monthlyRetainer) {
          updateData.monthlyRetainer = data.monthlyRetainer.toString();
        }
        return updateClient(id, updateData);
      }),
  }),

  // ============================================================
  // PROJECTS
  // ============================================================
  projects: router({
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          projectName: z.string(),
          services: z.string().optional(),
          botDescription: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createProject({
          ...input,
          status: "discovery",
          discoveryDate: new Date(),
        });
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProjectById(input.id);
      }),

    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return listProjectsByClient(input.clientId);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum([
            "discovery",
            "setup",
            "training",
            "testing",
            "live",
            "maintenance",
            "paused",
          ]),
        })
      )
      .mutation(async ({ input }) => {
        const { id, status } = input;
        const updateData: any = { status };

        if (status === "live") {
          updateData.goLiveDate = new Date();
        } else if (status === "setup") {
          updateData.setupStartDate = new Date();
        }

        return updateProject(id, updateData);
      }),

    updateWhatChimpConnection: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          whatChimpBotId: z.string(),
          whatsappNumber: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateProject(id, data);
      }),
  }),

  // ============================================================
  // INVOICES
  // ============================================================
  invoices: router({
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          invoiceType: z.enum(["setup", "retainer", "one_off"]),
          amount: z.number(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const invoiceNumber = `INV-${Date.now()}`;
        return createInvoice({
          ...input,
          invoiceNumber,
          amount: input.amount.toString() as any,
          status: "draft",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getInvoiceById(input.id);
      }),

    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return listInvoicesByClient(input.clientId);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
          paidDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateInvoice(id, data);
      }),
  }),

  // ============================================================
  // TASKS
  // ============================================================
  tasks: router({
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number().optional(),
          projectId: z.number().optional(),
          leadId: z.number().optional(),
          taskType: z.enum([
            "onboarding",
            "follow_up",
            "milestone",
            "reminder",
            "payment",
            "support",
          ]),
          title: z.string(),
          description: z.string().optional(),
          dueDate: z.date(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createTask({
          ...input,
          status: "pending",
        });
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getTaskById(input.id);
      }),

    list: protectedProcedure
      .input(
        z.object({
          status: z.string().optional(),
          clientId: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const query = await listTasks(input);
        return query;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        const { id, status } = input;
        const updateData: any = { status };
        if (status === "completed") {
          updateData.completedDate = new Date();
        }
        return updateTask(id, updateData);
      }),
  }),
});
