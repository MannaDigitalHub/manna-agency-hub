import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Send, Eye, DollarSign, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

const statusColors: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-300",
  sent: "bg-blue-500/20 text-blue-300",
  paid: "bg-green-500/20 text-green-300",
  overdue: "bg-red-500/20 text-red-300",
  cancelled: "bg-gray-500/20 text-gray-300",
};

export default function Invoices() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Invoicing</h1>
            <p className="text-slate-400">Manage invoices and payment tracking</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Invoiced</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R45,320.00</div>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Paid This Month</CardTitle>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R8,750.00</div>
              <p className="text-xs text-slate-400 mt-1">March 2026</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Outstanding</CardTitle>
              <Clock className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R3,200.00</div>
              <p className="text-xs text-slate-400 mt-1">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              {["all", "draft", "sent", "paid", "overdue", "cancelled"].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className={selectedStatus === status ? "bg-blue-600 hover:bg-blue-700" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                >
                  {formatStatus(status)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Client</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "INV-001",
                      client: "Luxury Resort Johannesburg",
                      type: "Retainer",
                      amount: "R2,500.00",
                      dueDate: "Mar 20, 2026",
                      status: "paid",
                    },
                    {
                      id: "INV-002",
                      client: "Garden Route Spa",
                      type: "Setup",
                      amount: "R5,000.00",
                      dueDate: "Mar 25, 2026",
                      status: "sent",
                    },
                    {
                      id: "INV-003",
                      client: "Local Restaurant",
                      type: "Retainer",
                      amount: "R1,500.00",
                      dueDate: "Mar 18, 2026",
                      status: "overdue",
                    },
                    {
                      id: "INV-004",
                      client: "Boutique Hotel",
                      type: "Retainer",
                      amount: "R3,000.00",
                      dueDate: "Mar 30, 2026",
                      status: "draft",
                    },
                  ].map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                      <td className="py-3 px-4 text-white font-mono">{invoice.id}</td>
                      <td className="py-3 px-4 text-slate-300">{invoice.client}</td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{invoice.type}</td>
                      <td className="py-3 px-4 text-white font-semibold">{invoice.amount}</td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{invoice.dueDate}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[invoice.status]}>
                          {formatStatus(invoice.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 p-0 h-auto">
                            <Download className="w-4 h-4" />
                          </Button>
                          {invoice.status === "draft" && (
                            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 p-0 h-auto">
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* PayFast Integration Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                <div>
                  <p className="text-white font-medium">PayFast</p>
                  <p className="text-xs text-slate-400">Connected and active</p>
                </div>
                <Badge className="bg-green-500/20 text-green-300">Active</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Invoices sent to clients will include a PayFast payment link for seamless payment processing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
