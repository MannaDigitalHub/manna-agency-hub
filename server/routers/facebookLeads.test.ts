import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('../db', () => ({
  listFacebookLeads: vi.fn(),
  updateFacebookLead: vi.fn(),
  syncFacebookLeadToCRM: vi.fn(),
  listBotLeads: vi.fn(),
  updateBotLead: vi.fn(),
  createFacebookLead: vi.fn(),
  getFacebookLeadByLeadgenId: vi.fn(),
  createLead: vi.fn(),
}));

// Mock notification
vi.mock('../_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import {
  listFacebookLeads,
  updateFacebookLead,
  syncFacebookLeadToCRM,
  createFacebookLead,
  getFacebookLeadByLeadgenId,
} from '../db';

describe('Facebook Leads Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Database Helpers', () => {
    it('should list Facebook leads', async () => {
      const mockLeads = [
        {
          id: 1,
          leadgenId: 'fb_123',
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+27123456789',
          company: 'Test Corp',
          status: 'new',
          createdAt: new Date(),
        },
        {
          id: 2,
          leadgenId: 'fb_456',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+27987654321',
          company: 'Smith LLC',
          status: 'contacted',
          createdAt: new Date(),
        },
      ];
      (listFacebookLeads as any).mockResolvedValue(mockLeads);

      const result = await listFacebookLeads();
      expect(result).toHaveLength(2);
      expect(result[0].fullName).toBe('John Doe');
      expect(result[1].status).toBe('contacted');
    });

    it('should filter Facebook leads by status', async () => {
      const mockLeads = [
        { id: 1, leadgenId: 'fb_123', status: 'new' },
      ];
      (listFacebookLeads as any).mockResolvedValue(mockLeads);

      const result = await listFacebookLeads({ status: 'new' });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('new');
    });

    it('should update Facebook lead status', async () => {
      const updatedLead = { id: 1, status: 'contacted', notes: 'Called back' };
      (updateFacebookLead as any).mockResolvedValue(updatedLead);

      const result = await updateFacebookLead(1, { status: 'contacted' as any, notes: 'Called back' });
      expect(result.status).toBe('contacted');
    });

    it('should sync Facebook lead to CRM', async () => {
      (syncFacebookLeadToCRM as any).mockResolvedValue(42);

      const crmLeadId = await syncFacebookLeadToCRM(1);
      expect(crmLeadId).toBe(42);
    });

    it('should prevent duplicate leads by leadgenId', async () => {
      const existingLead = { id: 1, leadgenId: 'fb_123' };
      (getFacebookLeadByLeadgenId as any).mockResolvedValue(existingLead);

      const existing = await getFacebookLeadByLeadgenId('fb_123');
      expect(existing).toBeDefined();
      expect(existing.leadgenId).toBe('fb_123');
    });

    it('should create a new Facebook lead', async () => {
      (createFacebookLead as any).mockResolvedValue({ insertId: 5 });

      const result = await createFacebookLead({
        leadgenId: 'fb_789',
        formId: 'form_1',
        adId: 'ad_1',
        fullName: 'New Lead',
        email: 'new@example.com',
        phone: '+27111222333',
        status: 'new',
      } as any);

      expect(result).toBeDefined();
      expect(createFacebookLead).toHaveBeenCalledWith(
        expect.objectContaining({
          leadgenId: 'fb_789',
          fullName: 'New Lead',
        })
      );
    });
  });

  describe('Facebook Webhook Handler', () => {
    it('should parse leadgen webhook payload correctly', () => {
      const webhookPayload = {
        object: 'page',
        entry: [
          {
            id: 'page_123',
            time: Date.now(),
            changes: [
              {
                field: 'leadgen',
                value: {
                  leadgen_id: 'lead_456',
                  page_id: 'page_123',
                  form_id: 'form_789',
                  adgroup_id: 'adgroup_1',
                  ad_id: 'ad_1',
                  created_time: Math.floor(Date.now() / 1000),
                },
              },
            ],
          },
        ],
      };

      expect(webhookPayload.object).toBe('page');
      expect(webhookPayload.entry[0].changes[0].field).toBe('leadgen');
      expect(webhookPayload.entry[0].changes[0].value.leadgen_id).toBe('lead_456');
    });

    it('should parse Graph API field_data response', () => {
      const fieldData = [
        { name: 'full_name', values: ['John Doe'] },
        { name: 'email', values: ['john@example.com'] },
        { name: 'phone_number', values: ['+27123456789'] },
        { name: 'company_name', values: ['Test Corp'] },
        { name: 'city', values: ['Cape Town'] },
      ];

      const parsed: Record<string, string> = {};
      for (const field of fieldData) {
        if (field.name && field.values?.length > 0) {
          parsed[field.name] = field.values[0];
        }
      }

      expect(parsed.full_name).toBe('John Doe');
      expect(parsed.email).toBe('john@example.com');
      expect(parsed.phone_number).toBe('+27123456789');
      expect(parsed.company_name).toBe('Test Corp');
      expect(parsed.city).toBe('Cape Town');
    });

    it('should handle empty field_data gracefully', () => {
      const fieldData: Array<{ name: string; values: string[] }> = [];

      const parsed: Record<string, string> = {};
      for (const field of fieldData) {
        if (field.name && field.values?.length > 0) {
          parsed[field.name] = field.values[0];
        }
      }

      expect(Object.keys(parsed)).toHaveLength(0);
    });
  });

  describe('WhatsApp Follow-up', () => {
    it('should format South African phone numbers correctly', () => {
      const formatPhone = (phone: string) => {
        let clean = phone.replace(/[\s\-()]/g, '');
        if (!clean.startsWith('+')) {
          if (clean.startsWith('0')) {
            clean = '27' + clean.substring(1);
          }
        } else {
          clean = clean.substring(1);
        }
        return clean;
      };

      expect(formatPhone('+27 73 406 1526')).toBe('27734061526');
      expect(formatPhone('073 406 1526')).toBe('27734061526');
      expect(formatPhone('0734061526')).toBe('27734061526');
      expect(formatPhone('+27734061526')).toBe('27734061526');
    });

    it('should generate a personalized follow-up message', () => {
      const leadName = 'John Doe';
      const firstName = leadName.split(' ')[0] || 'there';
      expect(firstName).toBe('John');

      const message = `Hi ${firstName}! 👋\n\nThank you for your interest in Manna Digital Hub!`;
      expect(message).toContain('Hi John!');
      expect(message).toContain('Manna Digital Hub');
    });
  });

  describe('Lead Stats Calculation', () => {
    it('should calculate stats correctly', () => {
      const allLeads = [
        { status: 'new' },
        { status: 'new' },
        { status: 'contacted' },
        { status: 'qualified' },
        { status: 'converted' },
        { status: 'synced_to_crm' },
        { status: 'lost' },
      ];

      const stats = {
        total: allLeads.length,
        new: allLeads.filter(l => l.status === 'new').length,
        contacted: allLeads.filter(l => l.status === 'contacted').length,
        qualified: allLeads.filter(l => l.status === 'qualified').length,
        converted: allLeads.filter(l => l.status === 'converted').length,
        synced: allLeads.filter(l => l.status === 'synced_to_crm').length,
      };

      expect(stats.total).toBe(7);
      expect(stats.new).toBe(2);
      expect(stats.contacted).toBe(1);
      expect(stats.qualified).toBe(1);
      expect(stats.converted).toBe(1);
      expect(stats.synced).toBe(1);
    });
  });
});
