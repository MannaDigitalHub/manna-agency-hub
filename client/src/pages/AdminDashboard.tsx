import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Users, TrendingUp, DollarSign, Bot, ArrowUpRight,
  Plus, FileText, MessageCircle
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: metrics } = trpc.analytics.dashboardMetrics.useQuery();

  const stats = [
    { icon: Users, label: "Active Clients", value: String(metrics?.activeClients ?? 0), change: "Total active", color: "from-blue-500/20 to-cyan-500/10", iconColor: "text-blue-400" },
    { icon: TrendingUp, label: "Monthly Revenue", value: `R${(metrics?.mrr ?? 0).toLocaleString()}`, change: "MRR", color: "from-emerald-500/20 to-green-500/10", iconColor: "text-emerald-400" },
    { icon: DollarSign, label: "Conversion Rate", value: `${metrics?.conversionRate ?? 0}%`, change: "Lead to client", color: "from-amber-500/20 to-orange-500/10", iconColor: "text-amber-400" },
    { icon: Bot, label: "Live Projects", value: String(metrics?.liveProjects ?? 0), change: "Active bots", color: "from-purple-500/20 to-pink-500/10", iconColor: "text-purple-400" },
  ];

  const quickActions = [
    { label: "Add Lead", icon: Plus, onClick: () => setLocation("/admin/leads") },
    { label: "New Project", icon: FileText, onClick: () => setLocation("/admin/projects") },
    { label: "Create Invoice", icon: DollarSign, onClick: () => setLocation("/admin/invoices") },
    { label: "Bot Leads", icon: MessageCircle, onClick: () => setLocation("/admin/bot-leads") },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name || "Admin"}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card key={i} className="bg-card border-border hover:border-primary/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">{s.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((a, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={a.onClick}
                className="h-auto py-4 flex flex-col items-center gap-2 border-border hover:border-primary/30 hover:bg-primary/5"
              >
                <a.icon className="w-5 h-5 text-primary" />
                <span>{a.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
