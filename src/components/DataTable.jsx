export function DataTable({ columns, rows }) {
  if (!columns?.length) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-raised/30 p-8 text-center text-sm text-zinc-500">
        Upload a CSV to preview rows here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-black/20">
              {columns.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-surface-border/60 transition-colors hover:bg-white/[0.03]"
              >
                {columns.map((c) => (
                  <td key={c} className="max-w-[240px] truncate px-4 py-2.5 text-zinc-300">
                    {formatCell(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCell(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
