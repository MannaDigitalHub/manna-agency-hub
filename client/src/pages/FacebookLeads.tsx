import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import {
  Facebook,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
  Zap,
  ExternalLink,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

export default function FacebookLeads() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const { data: leads, isLoading, refetch } = trpc.facebookLeads.list.useQuery(
    statusFilter ? { status: statusFilter } : undefined
  );
  const { data: stats } = trpc.facebookLeads.stats.useQuery();

  const updateLead = trpc.facebookLeads.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('Lead updated');
    },
  });

  const syncToCRM = trpc.facebookLeads.syncToCRM.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('Lead synced to CRM pipeline');
    },
    onError: (err) => {
      toast.error(`Sync failed: ${err.message}`);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'contacted': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'qualified': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'converted': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'lost': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'synced_to_crm': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'contacted': return <MessageSquare className="w-4 h-4" />;
      case 'qualified': return <Eye className="w-4 h-4" />;
      case 'converted': return <CheckCircle className="w-4 h-4" />;
      case 'synced_to_crm': return <ArrowRightLeft className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Facebook className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Facebook Leads</h1>
                <p className="text-muted-foreground mt-1">Auto-captured from Facebook Lead Ads campaigns</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-400">
              <Zap className="w-3 h-3" /> Auto-Sync Active
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" /> Total
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">{stats?.total || 0}</div>
          </Card>
          <Card className="p-4 border-blue-500/30 bg-blue-500/10">
            <div className="flex items-center gap-2 text-sm text-blue-300">
              <Clock className="w-4 h-4" /> New
            </div>
            <div className="text-2xl font-bold text-blue-200 mt-1">{stats?.new || 0}</div>
          </Card>
          <Card className="p-4 border-amber-500/30 bg-amber-500/10">
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <MessageSquare className="w-4 h-4" /> Contacted
            </div>
            <div className="text-2xl font-bold text-amber-200 mt-1">{stats?.contacted || 0}</div>
          </Card>
          <Card className="p-4 border-purple-500/30 bg-purple-500/10">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Eye className="w-4 h-4" /> Qualified
            </div>
            <div className="text-2xl font-bold text-purple-200 mt-1">{stats?.qualified || 0}</div>
          </Card>
          <Card className="p-4 border-emerald-500/30 bg-emerald-500/10">
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle className="w-4 h-4" /> Converted
            </div>
            <div className="text-2xl font-bold text-emerald-200 mt-1">{stats?.converted || 0}</div>
          </Card>
          <Card className="p-4 border-cyan-500/30 bg-cyan-500/10">
            <div className="flex items-center gap-2 text-sm text-cyan-300">
              <ArrowRightLeft className="w-4 h-4" /> Synced
            </div>
            <div className="text-2xl font-bold text-cyan-200 mt-1">{stats?.synced || 0}</div>
          </Card>
        </div>

        {/* How It Works Banner */}
        <Card className="p-4 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-blue-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Automated Lead Pipeline</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Facebook Lead Ad submitted → Webhook received → Lead saved → WhatsApp follow-up sent automatically → Owner notified.
                All leads appear here in real-time.
              </p>
            </div>
          </div>
        </Card>

        {/* Filter */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="synced_to_crm">Synced to CRM</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Leads Table */}
        <Card className="overflow-hidden bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Company</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Loading Facebook leads...
                    </td>
                  </tr>
                ) : !leads || leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Facebook className="w-12 h-12 text-blue-500/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No Facebook leads yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Leads will appear here automatically when someone fills out your Facebook Lead Ad form.
                      </p>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {lead.fullName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {lead.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {lead.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {lead.company || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-md w-fit ${getStatusColor(lead.status)}`}>
                          {getStatusIcon(lead.status)}
                          <span className="capitalize">{lead.status?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {lead.createdAt ? format(new Date(lead.createdAt), 'MMM dd, yyyy HH:mm') : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              updateLead.mutate({
                                id: lead.id,
                                status: e.target.value as any,
                              })
                            }
                            className="px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="converted">Converted</option>
                            <option value="synced_to_crm">Synced</option>
                            <option value="lost">Lost</option>
                          </select>
                          {lead.status !== 'synced_to_crm' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => syncToCRM.mutate({ id: lead.id })}
                              disabled={syncToCRM.isPending}
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Sync CRM
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Setup Instructions */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Facebook className="w-5 h-5 text-blue-400" />
            Facebook Lead Ads Setup
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-medium text-foreground">Create a Facebook Lead Ad</p>
                <p>Go to Facebook Ads Manager and create a Lead Generation campaign with an Instant Form.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-medium text-foreground">Configure the Webhook</p>
                <p>In Meta Developer Dashboard → Webhooks → Page → Subscribe to <code className="bg-muted px-1 rounded">leadgen</code>.</p>
                <p className="mt-1">
                  Webhook URL: <code className="bg-muted px-1 rounded text-emerald-400">https://your-domain.com/api/facebook/webhook</code>
                </p>
                <p>
                  Verify Token: <code className="bg-muted px-1 rounded text-emerald-400">manna_fb_verify_token</code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-medium text-foreground">Leads Flow Automatically</p>
                <p>When someone fills out your form: lead is saved → WhatsApp follow-up sent → you get notified → lead appears here.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
