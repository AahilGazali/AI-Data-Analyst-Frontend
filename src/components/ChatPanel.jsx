import { useEffect, useRef } from "react";
import { ResultChart } from "./ResultChart.jsx";

export function ChatPanel({
  messages,
  input,
  onInput,
  onSend,
  loading,
  disabledSend,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-surface-border bg-surface-raised/80 shadow-panel">
      <div className="border-b border-surface-border px-5 py-4">
        <h2 className="text-sm font-semibold text-white">Analyst chat</h2>
        <p className="text-xs text-zinc-500">Ask in plain English — charts update from your uploaded CSV.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="rounded-lg border border-dashed border-surface-border bg-black/20 p-6 text-center text-sm text-zinc-500">
            Try: “Show top 5 products by sales” · “Trend of revenue over month” · “Distribution of region”
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`fade-in flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "max-w-[78%] bg-gradient-to-r from-accent to-emerald-500 text-white"
                  : "w-full border border-surface-border bg-black/25 text-zinc-200"
              }`}
            >
              {m.role === "user" ? (
                m.content
              ) : (
                <div className="space-y-4">
                  {m.chartType === "table" && m.tableRows?.length > 0 ? (
                    <div className="fade-in overflow-hidden rounded-2xl border border-surface-border bg-surface-raised/90 shadow-panel">
                      <div className="border-b border-surface-border px-4 py-3">
                        <h3 className="text-sm font-semibold text-zinc-100">{m.chartTitle}</h3>
                        {m.filteredRowCount != null && m.tableRows.length < m.filteredRowCount && (
                          <p className="mt-1 text-xs text-zinc-500">
                            Showing {m.tableRows.length} of {m.filteredRowCount} matching rows.
                          </p>
                        )}
                      </div>
                      <div className="max-h-[360px] overflow-auto">
                        <table className="w-full min-w-[480px] border-collapse text-left text-xs">
                          <thead className="sticky top-0 z-10 bg-black/50 backdrop-blur-sm">
                            <tr className="border-b border-surface-border">
                              {(m.tableColumns?.length ? m.tableColumns : Object.keys(m.tableRows[0] || {})).map(
                                (col) => (
                                  <th
                                    key={col}
                                    className="whitespace-nowrap px-3 py-2 font-semibold uppercase tracking-wide text-zinc-400"
                                  >
                                    {col}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {m.tableRows.map((row, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-surface-border/60 hover:bg-white/[0.04]"
                              >
                                {(m.tableColumns?.length ? m.tableColumns : Object.keys(row)).map((col) => (
                                  <td key={col} className="max-w-[220px] truncate px-3 py-2 text-zinc-200">
                                    {row[col] === null || row[col] === undefined ? "—" : String(row[col])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <ResultChart chartType={m.chartType} title={m.chartTitle} series={m.series} />
                  )}
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Insight
                    </div>
                    <p className="mt-1 text-zinc-200">{m.insight}</p>
                  </div>
                  {m.plan && (
                    <details className="text-xs text-zinc-500">
                      <summary className="cursor-pointer select-none text-zinc-400">Structured plan</summary>
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-2 text-[11px] text-zinc-400">
                        {JSON.stringify(m.plan, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-black/30 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
              </div>
              <span className="text-xs text-zinc-500">Analyzing dataset…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-surface-border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => onInput(e.target.value)}
            placeholder="Ask a question about your data…"
            className="flex-1 rounded-xl border border-surface-border bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={disabledSend || loading}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
