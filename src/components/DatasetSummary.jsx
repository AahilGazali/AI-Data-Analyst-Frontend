export function DatasetSummary({ rowCount, columnCount, columns, fileName }) {
  if (!columns?.length) return null;
  return (
    <div className="fade-in grid gap-4 rounded-xl border border-surface-border bg-gradient-to-br from-surface-raised to-surface p-5 shadow-panel sm:grid-cols-3">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Rows</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{rowCount?.toLocaleString?.() ?? "—"}</div>
      </div>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Columns</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{columnCount ?? "—"}</div>
      </div>
      <div className="sm:col-span-1">
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">File</div>
        <div className="mt-1 truncate text-sm text-zinc-200" title={fileName}>
          {fileName || "—"}
        </div>
      </div>
      <div className="sm:col-span-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Column names</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {columns.map((c) => (
            <span
              key={c}
              className="rounded-md border border-surface-border bg-black/25 px-2 py-1 text-xs font-medium text-zinc-300"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
