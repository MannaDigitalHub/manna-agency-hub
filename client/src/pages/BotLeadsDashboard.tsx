import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { Eye, Download, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function BotLeadsDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Fetch leads
  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = trpc.botLeads.getLeads.useQuery({
    status: statusFilter || undefined,
    language: languageFilter || undefined,
    limit: 100,
    offset: 0,
  });

  // Fetch stats
  const { data: statsData } = trpc.botLeads.getStats.useQuery();

  // Update lead status mutation
  const updateStatus = trpc.botLeads.updateLeadStatus.useMutation({
    onSuccess: () => {
      refetchLeads();
    },
  });

  const leads = leadsData?.leads || [];
  const stats = statsData?.stats || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-purple-100 text-purple-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="w-4 h-4" />;
      case 'contacted':
        return <AlertCircle className="w-4 h-4" />;
      case 'qualified':
        return <Eye className="w-4 h-4" />;
      case 'converted':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bot Leads Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage and track all inquiries from your Manna Bot</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Leads</div>
          <div className="text-2xl font-bold text-foreground">{stats.total_leads || 0}</div>
        </Card>
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="text-sm text-blue-700">New</div>
          <div className="text-2xl font-bold text-blue-900">{stats.new_leads || 0}</div>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="text-sm text-yellow-700">Contacted</div>
          <div className="text-2xl font-bold text-yellow-900">{stats.contacted_leads || 0}</div>
        </Card>
        <Card className="p-4 border-purple-200 bg-purple-50">
          <div className="text-sm text-purple-700">Qualified</div>
          <div className="text-2xl font-bold text-purple-900">{stats.qualified_leads || 0}</div>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="text-sm text-green-700">Converted</div>
          <div className="text-2xl font-bold text-green-900">{stats.converted_leads || 0}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Filter by Language</label>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
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
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
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
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead.business_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline">{lead.language?.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-md w-fit ${getStatusColor(lead.status)}`}>
                        {getStatusIcon(lead.status)}
                        <span className="capitalize">{lead.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          updateStatus.mutate({
                            leadId: lead.id,
                            status: e.target.value as any,
                          })
                        }
                        className="px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                      >
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

      {/* Export Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export as CSV
        </Button>
      </div>
    </div>
  );
}
