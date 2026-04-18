import { useState } from "react";
import { authLogin, authSignup } from "../api.js";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const em = email.trim();
    if (!emailOk(em)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        if (password !== confirm) {
          setError("Passwords do not match.");
          return;
        }
        await authSignup(em, password);
        setPassword("");
        setConfirm("");
        setMode("login");
        setSuccessMessage("Account created. Sign in below with the same email and password.");
        return;
      }
      const data = await authLogin(em, password);
      if (data?.user?.email) onAuthenticated(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-lg font-bold text-accent ring-1 ring-accent/30">
            Σ
          </div>
          <h1 className="mt-4 text-xl font-semibold text-white">AI Data Analyst</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in or create an account to get started</p>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-raised/80 p-6 shadow-panel backdrop-blur-sm">
          <div className="mb-6 flex rounded-lg border border-surface-border bg-black/25 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === "login" ? "bg-white/10 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === "signup" ? "bg-white/10 text-white shadow-inner" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="mt-1.5 w-full rounded-lg border border-surface-border bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-accent/0 transition placeholder:text-zinc-600 focus:border-accent/50 focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium uppercase tracking-wide text-zinc-500"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="mt-1.5 w-full rounded-lg border border-surface-border bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-accent/0 transition placeholder:text-zinc-600 focus:border-accent/50 focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="auth-confirm"
                  className="block text-xs font-medium uppercase tracking-wide text-zinc-500"
                >
                  Confirm password
                </label>
                <input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={busy}
                  className="mt-1.5 w-full rounded-lg border border-surface-border bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-accent/0 transition placeholder:text-zinc-600 focus:border-accent/50 focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            )}

            {successMessage && mode === "login" && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? mode === "signup"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
