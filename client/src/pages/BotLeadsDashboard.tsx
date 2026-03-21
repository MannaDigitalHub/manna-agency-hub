import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { Eye, Download, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function BotLeadsDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = trpc.botLeads.getLeads.useQuery({
    status: statusFilter || undefined,
    language: languageFilter || undefined,
    limit: 100,
    offset: 0,
  });

  const { data: statsData } = trpc.botLeads.getStats.useQuery();

  const updateStatus = trpc.botLeads.updateLeadStatus.useMutation({
    onSuccess: () => { refetchLeads(); },
  });

  const leads = leadsData?.leads || [];
  const stats = statsData?.stats || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'contacted': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'qualified': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'converted': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'lost': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'contacted': return <AlertCircle className="w-4 h-4" />;
      case 'qualified': return <Eye className="w-4 h-4" />;
      case 'converted': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bot Leads Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage and track all inquiries from your Manna Bot</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground">Total Leads</div>
            <div className="text-2xl font-bold text-foreground">{stats.total_leads || 0}</div>
          </Card>
          <Card className="p-4 border-blue-500/30 bg-blue-500/10">
            <div className="text-sm text-blue-300">New</div>
            <div className="text-2xl font-bold text-blue-200">{stats.new_leads || 0}</div>
          </Card>
          <Card className="p-4 border-amber-500/30 bg-amber-500/10">
            <div className="text-sm text-amber-300">Contacted</div>
            <div className="text-2xl font-bold text-amber-200">{stats.contacted_leads || 0}</div>
          </Card>
          <Card className="p-4 border-purple-500/30 bg-purple-500/10">
            <div className="text-sm text-purple-300">Qualified</div>
            <div className="text-2xl font-bold text-purple-200">{stats.qualified_leads || 0}</div>
          </Card>
          <Card className="p-4 border-emerald-500/30 bg-emerald-500/10">
            <div className="text-sm text-emerald-300">Converted</div>
            <div className="text-2xl font-bold text-emerald-200">{stats.converted_leads || 0}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-card border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Filter by Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground">
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Filter by Language</label>
              <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground">
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="xh">Xhosa</option>
                <option value="zu">Zulu</option>
                <option value="st">Sotho</option>
                <option value="tn">Tswana</option>
                <option value="nd">Ndebele</option>
                <option value="ss">Swati</option>
                <option value="ts">Tsonga</option>
                <option value="ve">Venda</option>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Business</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Language</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leadsLoading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading leads...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No leads found</td></tr>
                ) : (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{lead.business_name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{lead.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm"><Badge variant="outline">{lead.language?.toUpperCase()}</Badge></td>
                      <td className="px-4 py-3 text-sm">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-md w-fit ${getStatusColor(lead.status)}`}>
                          {getStatusIcon(lead.status)}
                          <span className="capitalize">{lead.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{format(new Date(lead.created_at), 'MMM dd, yyyy')}</td>
                      <td className="px-4 py-3 text-sm">
                        <select value={lead.status}
                          onChange={(e) => updateStatus.mutate({ leadId: lead.id, status: e.target.value as any })}
                          className="px-2 py-1 border border-border rounded text-sm bg-background text-foreground">
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export as CSV
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
