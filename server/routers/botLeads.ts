import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';

export const botLeadsRouter = router({
  /**
   * Save a new lead from the chatbot
   */
  saveLead: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        language: z.string().default('en'),
        conversationSummary: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const leadId = crypto.randomUUID();
        const now = Date.now();

        // Insert into database using raw SQL
        const result = await (db as any).execute(
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
            'new',
            now,
            now,
          ]
        );

        return {
          success: true,
          leadId,
          message: 'Lead saved successfully',
        };
      } catch (error) {
        console.error('Error saving bot lead:', error);
        throw new Error('Failed to save lead. Please try again.');
      }
    }),

  /**
   * Get all bot leads
   */
  getLeads: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        language: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        let query = 'SELECT * FROM bot_leads WHERE 1=1';
        const params: any[] = [];

        if (input.status) {
          query += ' AND status = ?';
          params.push(input.status);
        }

        if (input.language) {
          query += ' AND language = ?';
          params.push(input.language);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(input.limit, input.offset);

        const leads = await (db as any).execute(query, params);

        return {
          success: true,
          leads: leads || [],
          count: leads?.length || 0,
        };
      } catch (error) {
        console.error('Error fetching bot leads:', error);
        throw new Error('Failed to fetch leads');
      }
    }),

  /**
   * Update lead status
   */
  updateLeadStatus: publicProcedure
    .input(
      z.object({
        leadId: z.string(),
        status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');

        const now = Date.now();

        await (db as any).execute(
          'UPDATE bot_leads SET status = ?, updated_at = ? WHERE id = ?',
          [input.status, now, input.leadId]
        );

        return {
          success: true,
          message: 'Lead status updated',
        };
      } catch (error) {
        console.error('Error updating lead status:', error);
        throw new Error('Failed to update lead status');
      }
    }),

  /**
   * Get lead statistics
   */
  getStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const stats = await (db as any).execute(
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
          converted_leads: 0,
        },
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Failed to fetch statistics');
    }
  }),
});
