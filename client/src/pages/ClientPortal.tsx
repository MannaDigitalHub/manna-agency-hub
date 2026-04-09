import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

type Tab = "projects" | "invoices" | "account";

const PROJECT_STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-900/40 text-emerald-400 border border-emerald-800",
  paused: "bg-amber-900/40 text-amber-400 border border-amber-800",
  cancelled: "bg-red-900/40 text-red-400 border border-red-800",
  trial: "bg-blue-900/40 text-blue-400 border border-blue-800",
};

const INVOICE_STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-900/40 text-emerald-400 border border-emerald-800",
  overdue: "bg-red-900/40 text-red-400 border border-red-800",
  sent: "bg-blue-900/40 text-blue-400 border border-blue-800",
  draft: "bg-gray-800 text-gray-400 border border-gray-700",
};

function StatusBadge({ status, styles }: { status: string; styles: Record<string, string> }) {
  const cls = styles[status.toLowerCase()] ?? "bg-gray-800 text-gray-400 border border-gray-700";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

function formatZAR(amount: number) {
  return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

export default function ClientPortal() {
  const [tab, setTab] = useState<Tab>("projects");
  const [deletionConfirm, setDeletionConfirm] = useState(false);
  const [, navigate] = useLocation();

  const meQuery = trpc.clientAuth.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (meQuery.isError) {
      navigate("/client");
    }
  }, [meQuery.isError, navigate]);

  const projectsQuery = trpc.clientPortal.getMyProjects.useQuery(undefined, {
    enabled: !!meQuery.data,
  });

  const invoicesQuery = trpc.clientPortal.getMyInvoices.useQuery(undefined, {
    enabled: !!meQuery.data,
  });

  const exportQuery = trpc.clientPortal.exportMyData.useQuery(undefined, {
    enabled: false,
  });

  const deletionMutation = trpc.clientPortal.requestDeletion.useMutation({
    onSuccess: () => {
      setDeletionConfirm(false);
      navigate("/client");
    },
  });

  const logoutMutation = trpc.clientAuth.logout.useMutation({
    onSuccess: () => {
      navigate("/client");
    },
  });

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `manna-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your portal…</p>
      </div>
    );
  }

  if (!meQuery.data) {
    return null;
  }

  const me = meQuery.data;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Manna Digital Hub</h1>
            <p className="text-gray-400 text-xs mt-0.5">Client Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">{me.businessName}</span>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-1.5 transition-colors"
            >
              {logoutMutation.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Welcome back{me.contactName ? `, ${me.contactName}` : ""}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{me.businessName}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {(["projects", "invoices", "account"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Projects Tab */}
        {tab === "projects" && (
          <div className="space-y-3">
            {projectsQuery.isLoading && (
              <p className="text-gray-400 text-sm">Loading projects…</p>
            )}
            {projectsQuery.data?.length === 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm">No projects yet.</p>
              </div>
            )}
            {projectsQuery.data?.map((project: any) => (
              <div
                key={project.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{project.name}</span>
                    <StatusBadge status={project.status} styles={PROJECT_STATUS_STYLES} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                    {project.goLiveDate && (
                      <span>Go-live: <span className="text-gray-300">{formatDate(project.goLiveDate)}</span></span>
                    )}
                    {project.whatsappNumber && (
                      <span>WhatsApp: <span className="text-gray-300">{project.whatsappNumber}</span></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoices Tab */}
        {tab === "invoices" && (
          <div className="space-y-3">
            {invoicesQuery.isLoading && (
              <p className="text-gray-400 text-sm">Loading invoices…</p>
            )}
            {invoicesQuery.data?.length === 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm">No invoices yet.</p>
              </div>
            )}
            {invoicesQuery.data?.map((invoice: any) => (
              <div
                key={invoice.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">
                      {invoice.invoiceNumber ?? `INV-${invoice.id}`}
                    </span>
                    <StatusBadge status={invoice.status} styles={INVOICE_STATUS_STYLES} />
                  </div>
                  <div className="mt-1.5 text-sm text-gray-400">
                    {invoice.dueDate && (
                      <span>Due: <span className="text-gray-300">{formatDate(invoice.dueDate)}</span></span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-white">
                    {formatZAR(invoice.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Account Tab */}
        {tab === "account" && (
          <div className="space-y-4">
            {/* Contact info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Contact Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-32 shrink-0">Business:</dt>
                  <dd className="text-white">{me.businessName}</dd>
                </div>
                {me.contactName && (
                  <div className="flex gap-2">
                    <dt className="text-gray-400 w-32 shrink-0">Contact:</dt>
                    <dd className="text-white">{me.contactName}</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-32 shrink-0">Email:</dt>
                  <dd className="text-white">{me.email}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-32 shrink-0">Status:</dt>
                  <dd>
                    <StatusBadge status={me.status ?? "active"} styles={PROJECT_STATUS_STYLES} />
                  </dd>
                </div>
              </dl>
            </div>

            {/* POPIA section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-1">Data & Privacy (POPIA)</h3>
              <p className="text-gray-400 text-sm mb-4">
                Under the Protection of Personal Information Act (POPIA), you have the right to access, correct,
                or delete your personal data.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExport}
                  disabled={exportQuery.isFetching}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  {exportQuery.isFetching ? "Preparing export…" : "Download My Data"}
                </button>

                <button
                  onClick={() => setDeletionConfirm(true)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  Request Account Deletion
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Deletion confirm dialog */}
      {deletionConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Request Account Deletion</h3>
            <p className="text-gray-400 text-sm mb-5">
              Are you sure you want to request deletion of your account and all associated data? This
              action cannot be undone. Our team will process your request within 30 days.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletionConfirm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deletionMutation.mutate()}
                disabled={deletionMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                {deletionMutation.isPending ? "Requesting…" : "Confirm deletion"}
              </button>
            </div>
            {deletionMutation.isError && (
              <p className="text-red-400 text-xs mt-3">{deletionMutation.error.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
