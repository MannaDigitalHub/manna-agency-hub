import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function ClientForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const resetMutation = trpc.clientAuth.requestPasswordReset.useMutation({
    onSettled: () => {
      // Always show success — never reveal whether email exists
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
          <p className="text-gray-400 text-sm mt-1">We'll send you a reset link</p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-4">
              <p className="text-emerald-400 text-sm font-medium">Check your inbox</p>
              <p className="text-gray-400 text-sm mt-1">
                If an account exists for <span className="text-white">{email}</span>, you'll receive a
                password reset link shortly.
              </p>
            </div>
            <Link href="/client" className="inline-block text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2 text-sm transition-colors"
            >
              {resetMutation.isPending ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-center text-sm text-gray-400">
              <Link href="/client" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
