export function HistoryPanel({ entries, onReuse, onClear }) {
  return (
    <div className="mx-auto max-w-6xl space-y-4 fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Query history</h2>
          <p className="text-sm text-zinc-500">Re-open past questions and continue analysis quickly.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={entries.length === 0}
          className="rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 disabled:opacity-40"
        >
          Clear history
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border bg-surface-raised/50 p-10 text-center text-sm text-zinc-500">
          No questions yet. Ask something in Dashboard and it will appear here.
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-surface-border bg-surface-raised/70 p-4 shadow-panel transition hover:border-zinc-600"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{entry.question}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {entry.chartType.toUpperCase()} · {entry.chartTitle} · {entry.timestamp}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onReuse(entry.question)}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-muted"
                >
                  Reuse query
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-400">{entry.insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
