import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

export default function WhatsAppIntegration() {
  const [webhookUrl] = useState('https://manna-hub-bpkfxojz.manus.space/api/whatsapp/webhook');
  const [verifyToken] = useState('manna_bot_verify_token_2024');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">WhatsApp Integration</h1>
        <p className="text-muted-foreground mt-2">Connect your Manna Bot to WhatsApp Business API</p>
      </div>

      {/* Status */}
      <Card className="p-6 border-l-4 border-l-yellow-500 bg-yellow-50">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900">Setup Required</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Follow the steps below to connect your Manna Bot to WhatsApp Business API
            </p>
          </div>
        </div>
      </Card>

      {/* Setup Steps */}
      <div className="space-y-4">
        {/* Step 1 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Create WhatsApp Business Account</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Go to{' '}
                <a
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline inline-flex items-center gap-1"
                >
                  Meta WhatsApp Cloud API <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and create a business account.
              </p>
            </div>
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Configure Webhook</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                In your WhatsApp Business App settings, configure the webhook with these values:
              </p>

              <div className="space-y-3 bg-muted p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-foreground">Webhook URL</label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground break-all">
                      {webhookUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(webhookUrl)}
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Verify Token</label>
                  <div className="flex gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground break-all">
                      {verifyToken}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(verifyToken)}
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Subscribe to Events</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subscribe to: messages, message_template_status_update, message_echo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Get Your Phone Number ID</h3>
              <p className="text-sm text-muted-foreground mt-2">
                From Meta Business Manager, get your WhatsApp Business Phone Number ID and add it to your environment variables.
              </p>
              <div className="mt-3 p-3 bg-muted rounded text-sm font-mono text-foreground">
                WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
              </div>
            </div>
          </div>
        </Card>

        {/* Step 4 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Test Your Connection</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Send a test message to your WhatsApp number. The bot should respond automatically with the welcome message.
              </p>
              <Button className="mt-4 gap-2">
                <CheckCircle className="w-4 h-4" />
                Test Connection
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">WhatsApp Bot Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">10 Languages</p>
              <p className="text-sm text-muted-foreground">Automatic language detection</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Lead Capture</p>
              <p className="text-sm text-muted-foreground">Auto-save inquiries to database</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">24/7 Availability</p>
              <p className="text-sm text-muted-foreground">Always respond to customers</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Real-time Analytics</p>
              <p className="text-sm text-muted-foreground">Track all conversations</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Support */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-800 mb-4">
          Contact our support team for assistance with WhatsApp integration setup.
        </p>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="w-4 h-4" />
          Contact Support
        </Button>
      </Card>
    </div>
  );
}
