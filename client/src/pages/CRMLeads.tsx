import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, Mail, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

export default function CRMLeads() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: leads, isLoading } = trpc.crm.leads.list.useQuery(
    { status: statusFilter || undefined },
    { enabled: true }
  );

  const filteredLeads = leads?.filter((lead: any) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prospect":
        return "bg-blue-500/20 text-blue-300";
      case "call_booked":
        return "bg-purple-500/20 text-purple-300";
      case "client":
        return "bg-green-500/20 text-green-300";
      case "not_interested":
        return "bg-red-500/20 text-red-300";
      case "on_hold":
        return "bg-yellow-500/20 text-yellow-300";
      default:
        return "bg-slate-500/20 text-slate-300";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Pipeline</h1>
            <p className="text-slate-400">Manage and track Apollo leads through the sales funnel</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search by name or business..."
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="call_booked">Call Booked</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No leads found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Business</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Interest</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Last Follow-up</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead: any) => (
                      <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{lead.businessName}</p>
                            <p className="text-xs text-slate-400">{lead.businessType}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-slate-300 text-xs">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-slate-300 text-xs">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(lead.status)}>
                            {formatStatus(lead.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">{lead.serviceInterest || "-"}</td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {lead.lastFollowUp
                            ? new Date(lead.lastFollowUp).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Prospects", count: filteredLeads.filter((l: any) => l.status === "prospect").length, color: "bg-blue-500/20 text-blue-300" },
            { label: "Calls Booked", count: filteredLeads.filter((l: any) => l.status === "call_booked").length, color: "bg-purple-500/20 text-purple-300" },
            { label: "Clients", count: filteredLeads.filter((l: any) => l.status === "client").length, color: "bg-green-500/20 text-green-300" },
            { label: "Not Interested", count: filteredLeads.filter((l: any) => l.status === "not_interested").length, color: "bg-red-500/20 text-red-300" },
            { label: "On Hold", count: filteredLeads.filter((l: any) => l.status === "on_hold").length, color: "bg-yellow-500/20 text-yellow-300" },
          ].map((item: any) => (
            <Card key={item.label} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center">
                <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                <p className="text-xs text-slate-400 mt-2">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
