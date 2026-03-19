import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Calendar, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

const statusColors: Record<string, string> = {
  discovery: "bg-blue-500/20 text-blue-300",
  setup: "bg-cyan-500/20 text-cyan-300",
  training: "bg-purple-500/20 text-purple-300",
  testing: "bg-orange-500/20 text-orange-300",
  live: "bg-green-500/20 text-green-300",
  maintenance: "bg-yellow-500/20 text-yellow-300",
  paused: "bg-red-500/20 text-red-300",
};

const statusSteps = ["discovery", "setup", "training", "testing", "live", "maintenance"];

export default function Projects() {
  const { data: analytics } = trpc.analytics.projectStatusBreakdown.useQuery();

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Bot Projects</h1>
            <p className="text-slate-400">Track and manage WhatsApp bot deployments for clients</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Project Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {statusSteps.map((status) => (
            <Card key={status} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-white">{analytics?.[status as keyof typeof analytics] || 0}</p>
                <p className="text-xs text-slate-400 mt-2 capitalize">{status}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Lifecycle Guide */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Project Lifecycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {statusSteps.map((status, index) => (
                <div key={status} className="flex items-center gap-2 min-w-max">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${statusColors[status]}`}>
                    {index + 1}
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-medium capitalize">{status}</p>
                    <p className="text-xs text-slate-400">
                      {status === "discovery" && "Understand needs"}
                      {status === "setup" && "Configure bot"}
                      {status === "training" && "Train AI model"}
                      {status === "testing" && "QA & testing"}
                      {status === "live" && "Go live"}
                      {status === "maintenance" && "Support"}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && <div className="w-8 h-0.5 bg-slate-600 hidden md:block" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Projects Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample Project Card */}
              <div className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">Hotel Booking Bot</h3>
                    <p className="text-sm text-slate-400">Luxury Resort Johannesburg</p>
                  </div>
                  <Badge className={statusColors["live"]}>Live</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Bot ID</p>
                    <p className="text-white font-mono">BOT-2024-001</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">WhatsApp Number</p>
                    <p className="text-white font-mono">+27 73 406 1526</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Go-Live Date</p>
                    <p className="text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Mar 15, 2026
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Conversations</p>
                    <p className="text-white flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      1,234
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    View Logs
                  </Button>
                </div>
              </div>

              {/* Empty State */}
              <div className="text-center py-8 text-slate-400">
                <p>No projects yet. Create your first bot deployment to get started.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Checklist */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Deployment Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Client requirements gathered",
                "WhatChimp bot configured",
                "AI model trained and tested",
                "WhatsApp Business API connected",
                "Conversation flows verified",
                "Performance testing completed",
                "Client training completed",
                "Go-live approved",
              ].map((item, index) => (
                <label key={index} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 cursor-pointer"
                  />
                  <span className="text-slate-300 group-hover:text-white transition">{item}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
