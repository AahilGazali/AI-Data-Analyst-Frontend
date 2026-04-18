import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#10a37f", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#14b8a6", "#eab308"];

export function ResultChart({ chartType, title, series }) {
  if (!chartType || chartType === "none" || !series?.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-raised/40 text-sm text-zinc-500">
        No chart for this answer — see the insight below.
      </div>
    );
  }

  const data = series.map((s) => ({ name: String(s.name), value: Number(s.value) || 0 })).slice(0, 12);
  const pieData = data.slice(0, 6);
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const top = [...data].sort((a, b) => b.value - a.value)[0];
  const avg = data.length ? total / data.length : 0;

  const chartCardClass =
    "rounded-xl border border-surface-border/80 bg-black/20 p-3 sm:p-4";
  const tooltipStyle = {
    background: "#161b22",
    border: "1px solid #2d333b",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="fade-in rounded-2xl border border-surface-border bg-surface-raised/90 p-4 shadow-panel">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        <span className="rounded-full border border-surface-border bg-black/30 px-2.5 py-1 text-[11px] text-zinc-400">
          Suggested: {chartType}
        </span>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total" value={fmt(total)} />
        <MetricCard label="Average" value={fmt(avg)} />
        <MetricCard label="Top Segment" value={top ? `${top.name} (${fmt(top.value)})` : "—"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className={chartCardClass}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Bar chart</div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  stroke="#3f3f46"
                  angle={-20}
                  textAnchor="end"
                  height={48}
                />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#3f3f46" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#10a37f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartCardClass}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Line chart</div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#3f3f46" />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} stroke="#3f3f46" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${chartCardClass} xl:col-span-2`}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Pie chart (top 6)</div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={115}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {pieData.map((entry, i) => (
              <span
                key={entry.name}
                className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-black/20 px-2 py-1 text-[11px] text-zinc-300"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                {entry.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-lg border border-surface-border bg-black/20 px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  );
}

function fmt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
