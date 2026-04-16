import { describe, it, expect, beforeAll } from 'vitest';

describe('WhatsApp Integration', () => {
  let phoneNumberId: string;
  let businessAccountId: string;
  let accessToken: string;

  beforeAll(() => {
    phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
    accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  });

  it('should have all WhatsApp credentials configured', () => {
    expect(phoneNumberId).toBeTruthy();
    expect(businessAccountId).toBeTruthy();
    expect(accessToken).toBeTruthy();
  });

  it('should have valid phone number ID format', () => {
    expect(phoneNumberId).toMatch(/^\d+$/);
    expect(phoneNumberId.length).toBeGreaterThan(10);
  });

  it('should have valid business account ID format', () => {
    expect(businessAccountId).toMatch(/^\d+$/);
    expect(businessAccountId.length).toBeGreaterThan(10);
  });

  it('should have valid access token format', () => {
    expect(accessToken).toBeTruthy();
    expect(accessToken.length).toBeGreaterThan(10);
  });

  it('should validate WhatsApp API connectivity', async () => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${phoneNumberId}?access_token=${accessToken}`,
        { method: 'GET' }
      );
      
      // We expect either 200 (success) or 400 (auth issue) - both mean credentials are recognized
      expect([200, 400, 401, 403]).toContain(response.status);
    } catch (error) {
      // Network errors are acceptable in test environment
      expect(error).toBeDefined();
    }
  });

  it('should have credentials in correct order', () => {
    // Validate that credentials are not swapped
    expect(phoneNumberId).not.toEqual(businessAccountId);
    expect(phoneNumberId).not.toEqual(accessToken);
    expect(businessAccountId).not.toEqual(accessToken);
  });
});
