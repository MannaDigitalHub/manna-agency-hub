import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  listFacebookLeads,
  updateFacebookLead,
  syncFacebookLeadToCRM,
  listBotLeads,
  updateBotLead,
} from "../db";

export const facebookLeadsRouter = router({
  // List all Facebook leads with optional status filter
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return listFacebookLeads(input || undefined);
    }),

  // Update a Facebook lead's status or notes
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "contacted", "qualified", "converted", "lost", "synced_to_crm"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateFacebookLead(id, data);
    }),

  // Sync a Facebook lead to the CRM leads table
  syncToCRM: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return syncFacebookLeadToCRM(input.id);
    }),

  // Get dashboard stats for Facebook leads
  stats: protectedProcedure.query(async () => {
    const allLeads = await listFacebookLeads();
    const total = allLeads.length;
    const newLeads = allLeads.filter((l: any) => l.status === "new").length;
    const contacted = allLeads.filter((l: any) => l.status === "contacted").length;
    const qualified = allLeads.filter((l: any) => l.status === "qualified").length;
    const converted = allLeads.filter((l: any) => l.status === "converted").length;
    const synced = allLeads.filter((l: any) => l.status === "synced_to_crm").length;

    return {
      total,
      new: newLeads,
      contacted,
      qualified,
      converted,
      synced,
    };
  }),

  // List bot leads (website + WhatsApp)
  listBotLeads: protectedProcedure.query(async () => {
    return listBotLeads();
  }),

  // Update bot lead status
  updateBotLead: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateBotLead(id, data);
    }),
});
