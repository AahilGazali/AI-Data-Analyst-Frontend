export function Navbar({ apiOk, title = "AI Data Analyst", userEmail, onLogout }) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-surface-border bg-surface/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-sm font-bold text-accent ring-1 ring-accent/30">
          Σ
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-white">{title}</h1>
          <p className="text-[11px] text-zinc-500">Natural language · Charts · Insights</p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        {userEmail && (
          <span className="hidden truncate text-xs text-zinc-500 sm:inline" title={userEmail}>
            {userEmail}
          </span>
        )}
        {typeof onLogout === "function" && (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            Log out
          </button>
        )}
        <span
          className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            apiOk ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-300"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${apiOk ? "bg-emerald-400" : "bg-amber-400"}`} />
          {apiOk ? "API ready" : "Check API / key"}
        </span>
      </div>
    </header>
  );
}
