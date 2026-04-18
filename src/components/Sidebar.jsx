export function Sidebar({ active, onSelect, historyCount = 0 }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: "◉" },
    { id: "upload", label: "Upload", icon: "↑" },
    { id: "history", label: "History", icon: "◷" },
  ];

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-surface-border bg-surface-raised/80 backdrop-blur-sm">
      <div className="px-4 py-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Workspace</div>
        <div className="mt-1 text-[11px] text-zinc-600">Analytics workspace</div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pb-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              active === item.id
                ? "bg-white/10 text-white shadow-inner"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <span className="text-base opacity-80">{item.icon}</span>
            {item.label}
            {item.id === "history" && historyCount > 0 && (
              <span className="ml-auto rounded-md bg-accent/20 px-2 py-0.5 text-[10px] text-accent">
                {historyCount}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="border-t border-surface-border p-4 text-xs leading-relaxed text-zinc-500">
        Natural language analytics. Uploaded files are processed in isolated server sessions and are not written to a
        shared database.
      </div>
    </aside>
  );
}
