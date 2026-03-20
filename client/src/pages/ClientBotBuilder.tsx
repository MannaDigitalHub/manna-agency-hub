import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Copy, Eye, Settings, Zap, MessageSquare } from 'lucide-react';

const clientBots = [
  {
    id: 1,
    name: 'TechStart Bot',
    client: 'TechStart Solutions',
    status: 'active',
    messages: 12450,
    leads: 342,
    languages: 3,
    created: '2024-01-15',
    whatsappNumber: '+27 71 234 5678',
  },
  {
    id: 2,
    name: 'RetailPro Bot',
    client: 'RetailPro Group',
    status: 'active',
    messages: 8932,
    leads: 215,
    languages: 5,
    created: '2024-02-01',
    whatsappNumber: '+27 82 456 7890',
  },
  {
    id: 3,
    name: 'ServiceHub Bot',
    client: 'ServiceHub Africa',
    status: 'inactive',
    messages: 3421,
    leads: 87,
    languages: 2,
    created: '2024-02-15',
    whatsappNumber: '+27 73 678 9012',
  },
];

export default function ClientBotBuilder() {
  const [showNewBot, setShowNewBot] = useState(false);
  const [newBot, setNewBot] = useState({ name: '', client: '', whatsappNumber: '' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Bot Builder</h1>
          <p className="text-muted-foreground mt-2">Create and manage WhatsApp bots for your clients</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNewBot(!showNewBot)}>
          <Plus className="w-4 h-4" />
          Create New Bot
        </Button>
      </div>

      {/* Create New Bot Form */}
      {showNewBot && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h2 className="text-xl font-bold text-foreground mb-4">Create New Client Bot</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Bot Name (e.g., ClientName Bot)"
              value={newBot.name}
              onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
            />
            <Input
              placeholder="Client Name"
              value={newBot.client}
              onChange={(e) => setNewBot({ ...newBot, client: e.target.value })}
            />
            <Input
              placeholder="WhatsApp Number (+27...)"
              value={newBot.whatsappNumber}
              onChange={(e) => setNewBot({ ...newBot, whatsappNumber: e.target.value })}
            />
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            The bot will be created with default flows. You can customize it after creation.
          </p>
        </Card>
      )}

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientBots.map((bot) => (
          <Card key={bot.id} className="p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{bot.name}</h3>
                <p className="text-sm text-muted-foreground">{bot.client}</p>
              </div>
              <Badge className={bot.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {bot.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
              </Badge>
            </div>

            {/* WhatsApp Number */}
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-muted-foreground mb-1">WhatsApp Number</p>
              <p className="font-mono font-bold text-foreground">{bot.whatsappNumber}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-border">
              <div>
                <div className="text-lg font-bold text-green-600">{bot.messages}</div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{bot.leads}</div>
                <div className="text-xs text-muted-foreground">Leads</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{bot.languages}</div>
                <div className="text-xs text-muted-foreground">Languages</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-1">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1">
                <Settings className="w-4 h-4" />
                Configure
              </Button>
              <Button size="sm" variant="ghost" className="gap-1 text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Bot Builder Guide */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <h2 className="text-2xl font-bold text-foreground mb-6">How to Build a Client Bot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
              <h3 className="font-bold text-foreground">Create Bot</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter bot name, client name, and WhatsApp number. The bot is created instantly with default flows.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
              <h3 className="font-bold text-foreground">Configure Flows</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Customize conversation flows, add your services, set up lead capture, and choose languages.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
              <h3 className="font-bold text-foreground">Deploy & Monitor</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Deploy to WhatsApp, monitor performance, track leads, and optimize based on analytics.
            </p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Bot Capabilities
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ 10 languages support</li>
            <li>✓ Automatic lead capture</li>
            <li>✓ Custom conversation flows</li>
            <li>✓ Real-time analytics</li>
            <li>✓ Integration with CRM</li>
            <li>✓ Automated responses</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Quick Setup
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ 5 minutes to create bot</li>
            <li>✓ Pre-built flow templates</li>
            <li>✓ One-click deployment</li>
            <li>✓ Instant WhatsApp connection</li>
            <li>✓ No coding required</li>
            <li>✓ Full customization available</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
