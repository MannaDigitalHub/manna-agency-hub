import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, useSearch, Link } from "wouter";

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function CheckItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-400" : "text-gray-500"}`}>
      <span className={`inline-block w-3.5 h-3.5 rounded-full border text-center leading-[13px] text-[9px] font-bold ${met ? "border-emerald-400 bg-emerald-400/10" : "border-gray-600"}`}>
        {met ? "✓" : ""}
      </span>
      {label}
    </li>
  );
}

export default function ClientSetup() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const verifyQuery = trpc.clientAuth.verifyInviteToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const setupMutation = trpc.clientAuth.setup.useMutation({
    onSuccess: () => {
      navigate("/client/portal");
    },
    onError: (err) => {
      setError(err.message || "Setup failed. Please try again.");
    },
  });

  const checks = getPasswordChecks(password);
  const allChecksMet = Object.values(checks).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allChecksMet) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!consent) {
      setError("You must accept the Privacy Policy to continue.");
      return;
    }

    setupMutation.mutate({ token, password, consentAccepted: true });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
          <p className="text-red-400 text-sm">Invalid or missing invite link.</p>
          <Link href="/client" className="mt-4 inline-block text-emerald-400 text-sm hover:text-emerald-300">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (verifyQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <p className="text-gray-400 text-sm">Verifying invite…</p>
      </div>
    );
  }

  if (verifyQuery.isError || !verifyQuery.data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
          <p className="text-red-400 text-sm">This invite link is invalid or has expired.</p>
          <Link href="/client" className="mt-4 inline-block text-emerald-400 text-sm hover:text-emerald-300">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const { email, businessName } = verifyQuery.data;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to Manna Digital Hub</h1>
          <p className="text-gray-400 text-sm mt-1">Set up your client account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Business</label>
            <input
              type="text"
              value={businessName}
              readOnly
              className="w-full bg-gray-800/50 border border-gray-700 text-gray-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-gray-800/50 border border-gray-700 text-gray-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="••••••••••"
            />
            <ul className="mt-2 space-y-1 pl-0.5">
              <CheckItem met={checks.length} label="At least 10 characters" />
              <CheckItem met={checks.uppercase} label="Uppercase letter" />
              <CheckItem met={checks.lowercase} label="Lowercase letter" />
              <CheckItem met={checks.number} label="Number" />
              <CheckItem met={checks.special} label="Special character" />
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={`w-full bg-gray-800 border text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-500"
                  : "border-gray-700"
              }`}
              placeholder="••••••••••"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900 cursor-pointer"
            />
            <label htmlFor="consent" className="text-sm text-gray-300 cursor-pointer leading-snug">
              I have read and agree to the{" "}
              <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={setupMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {setupMutation.isPending ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
