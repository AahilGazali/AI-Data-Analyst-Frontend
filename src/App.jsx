import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { uploadCsv, sendQuery, health, fetchAuthMe, authLogout } from "./api.js";
import { Sidebar } from "./components/Sidebar.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { CsvDropzone } from "./components/CsvDropzone.jsx";
import { DataTable } from "./components/DataTable.jsx";
import { DatasetSummary } from "./components/DatasetSummary.jsx";
import { ChatPanel } from "./components/ChatPanel.jsx";
import { HistoryPanel } from "./components/HistoryPanel.jsx";
import { AuthPage } from "./components/AuthPage.jsx";

let msgId = 0;
const nextId = () => `m-${++msgId}`;

/** Per authenticated user so switching accounts never reuses another user's workspace. */
function workspaceStorageKey(userId) {
  return `ai-analyst-dashboard-state-v2:${String(userId)}`;
}

function legacyEmailWorkspaceKey(email) {
  return `ai-analyst-dashboard-state-v1:${String(email).toLowerCase()}`;
}

function loadWorkspaceSnapshot(userId, email) {
  const key = workspaceStorageKey(userId);
  let raw = localStorage.getItem(key);
  if (!raw && email) {
    const oldByEmail = localStorage.getItem(legacyEmailWorkspaceKey(email));
    if (oldByEmail) {
      raw = oldByEmail;
      try {
        localStorage.setItem(key, oldByEmail);
        localStorage.removeItem(legacyEmailWorkspaceKey(email));
      } catch {
        // ignore quota errors
      }
    }
  }
  // Do not migrate the old global unscoped key — it would attach one browser's CSV to every new account.
  return raw;
}

function defaultWorkspaceState() {
  return {
    uploadId: null,
    fileName: "",
    columns: [],
    previewRows: [],
    rowCount: 0,
    columnCount: 0,
    messages: [],
    historyEntries: [],
    view: "dashboard",
  };
}

function applyWorkspaceFromStorage(raw, setters, expectedUserId) {
  if (!raw) {
    const d = defaultWorkspaceState();
    setters.setUploadId(d.uploadId);
    setters.setFileName(d.fileName);
    setters.setColumns(d.columns);
    setters.setPreviewRows(d.previewRows);
    setters.setRowCount(d.rowCount);
    setters.setColumnCount(d.columnCount);
    setters.setMessages(d.messages);
    setters.setHistoryEntries(d.historyEntries);
    setters.setView(d.view);
    return;
  }
  try {
    const saved = JSON.parse(raw);
    if (
      !saved.workspaceOwnerId ||
      String(saved.workspaceOwnerId) !== String(expectedUserId)
    ) {
      applyWorkspaceFromStorage(null, setters, expectedUserId);
      return;
    }
    setters.setUploadId(saved.uploadId ?? null);
    setters.setFileName(saved.fileName ?? "");
    setters.setColumns(Array.isArray(saved.columns) ? saved.columns : []);
    setters.setPreviewRows(Array.isArray(saved.previewRows) ? saved.previewRows : []);
    setters.setRowCount(Number(saved.rowCount) || 0);
    setters.setColumnCount(Number(saved.columnCount) || 0);
    setters.setMessages(Array.isArray(saved.messages) ? saved.messages : []);
    setters.setHistoryEntries(Array.isArray(saved.historyEntries) ? saved.historyEntries : []);
    setters.setView(saved.view === "upload" || saved.view === "history" ? saved.view : "dashboard");
  } catch {
    applyWorkspaceFromStorage(null, setters, expectedUserId);
  }
}

export default function App() {
  const [userSession, setUserSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [view, setView] = useState("dashboard");
  const [apiOk, setApiOk] = useState(false);

  const [uploadId, setUploadId] = useState(null);
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [columnCount, setColumnCount] = useState(0);

  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const activeUserIdRef = useRef(null);
  activeUserIdRef.current = userSession?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchAuthMe();
        if (cancelled) return;
        if (me?.user?.email && me?.user?.id) {
          setUserSession({ email: me.user.email, id: me.user.id });
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
          setAuthReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (!isHydrated || !userSession?.id) return;
    const raw = loadWorkspaceSnapshot(userSession.id, userSession.email);
    applyWorkspaceFromStorage(raw, {
      setUploadId,
      setFileName,
      setColumns,
      setPreviewRows,
      setRowCount,
      setColumnCount,
      setMessages,
      setHistoryEntries,
      setView,
    }, userSession.id);
  }, [isHydrated, userSession?.id, userSession?.email]);

  useEffect(() => {
    const uid = activeUserIdRef.current;
    if (!isHydrated || !uid) return;
    const payload = {
      workspaceOwnerId: uid,
      uploadId,
      fileName,
      columns,
      previewRows,
      rowCount,
      columnCount,
      messages,
      historyEntries,
      view,
    };
    try {
      localStorage.setItem(workspaceStorageKey(uid), JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [uploadId, fileName, columns, previewRows, rowCount, columnCount, messages, historyEntries, view, isHydrated]);

  useEffect(() => {
    try {
      localStorage.removeItem("ai-analyst-dashboard-state-v1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    health()
      .then((h) => setApiOk(Boolean(h?.ok && h?.hasAI)))
      .catch(() => setApiOk(false));
  }, []);

  const hasData = Boolean(uploadId && columns.length);

  const onFile = useCallback(async (file) => {
    setUploadError(null);
    setUploadBusy(true);
    try {
      const data = await uploadCsv(file);
      setUploadId(data.uploadId);
      setFileName(data.fileName || file.name);
      setColumns(data.columns || []);
      setPreviewRows(data.previewRows || []);
      setRowCount(data.rowCount ?? 0);
      setColumnCount(data.columnCount ?? 0);
      setMessages([]);
      setHistoryEntries([]);
      setView("dashboard");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !uploadId) return;
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content:
        m.role === "user" ? m.content : m.insight ? `Insight: ${m.insight}` : "",
    }));
    const userMsg = { id: nextId(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setQueryLoading(true);
    try {
      const res = await sendQuery(uploadId, text, historyPayload);
      const assistantMsg = {
        id: nextId(),
        role: "assistant",
        content: "",
        chartType: res.chartType,
        chartTitle: res.chartTitle,
        series: res.series,
        tableRows: res.tableRows || [],
        tableColumns: res.tableColumns || [],
        filteredRowCount: res.filteredRowCount,
        insight: res.insight,
        plan: res.plan,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setHistoryEntries((prev) => [
        {
          id: nextId(),
          question: text,
          chartType: res.chartType || "none",
          chartTitle: res.chartTitle || "Result",
          insight: res.insight || "Analysis complete.",
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    } catch (e) {
      const errMsg = {
        id: nextId(),
        role: "assistant",
        content: "",
        chartType: "none",
        chartTitle: "Error",
        series: [],
        tableRows: [],
        tableColumns: [],
        insight: e instanceof Error ? e.message : "Something went wrong.",
        plan: null,
      };
      setMessages((prev) => [...prev, errMsg]);
      setHistoryEntries((prev) => [
        {
          id: nextId(),
          question: text,
          chartType: "none",
          chartTitle: "Error",
          insight: errMsg.insight,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    } finally {
      setQueryLoading(false);
    }
  }, [chatInput, uploadId, messages]);

  const tableColumns = useMemo(() => columns, [columns]);

  const handleLogout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      // still sign out locally
    }
    applyWorkspaceFromStorage(null, {
      setUploadId,
      setFileName,
      setColumns,
      setPreviewRows,
      setRowCount,
      setColumnCount,
      setMessages,
      setHistoryEntries,
      setView,
    }, null);
    setUserSession(null);
  }, []);

  if (!authReady) {
    return (
      <div className="dashboard-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-accent" aria-label="Loading" />
      </div>
    );
  }

  if (!userSession) {
    return (
      <AuthPage
        onAuthenticated={(user) => setUserSession({ email: user.email, id: user.id })}
      />
    );
  }

  return (
    <div className="dashboard-bg flex min-h-screen">
      <Sidebar active={view} onSelect={setView} historyCount={historyEntries.length} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          apiOk={apiOk}
          title={fileName ? `AI Data Analyst · ${fileName}` : "AI Data Analyst"}
          userEmail={userSession.email}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto p-6">
          {uploadError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {uploadError}
            </div>
          )}
          {view === "upload" && (
            <div className="mx-auto max-w-3xl space-y-6 fade-in">
              <div className="rounded-2xl border border-surface-border bg-surface-raised/70 p-6 shadow-panel">
                <h2 className="text-lg font-semibold text-white">Upload dataset</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Files are parsed on the server for your signed-in session. Data stays session-scoped and is not stored
                  in an application database.
                </p>
                <div className="mt-4 grid gap-3 text-xs text-zinc-400 sm:grid-cols-3">
                  <div className="rounded-lg border border-surface-border bg-black/20 px-3 py-2">Session isolation</div>
                  <div className="rounded-lg border border-surface-border bg-black/20 px-3 py-2">Conversational analysis</div>
                  <div className="rounded-lg border border-surface-border bg-black/20 px-3 py-2">Adaptive charts</div>
                </div>
              </div>
              <CsvDropzone onFile={onFile} busy={uploadBusy} disabled={false} />
              {uploadBusy && (
                <div className="space-y-2">
                  <div className="h-3 w-40 animate-pulse rounded bg-zinc-700" />
                  <div className="h-32 animate-pulse rounded-xl bg-zinc-800/80" />
                </div>
              )}
            </div>
          )}

          {view === "dashboard" && (
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Dashboard</h2>
                  <p className="text-sm text-zinc-500">
                    Explore your CSV, then ask questions in the analyst chat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setView("upload")}
                  className="rounded-lg border border-surface-border bg-surface-raised px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
                >
                  Replace CSV
                </button>
              </div>

              {!hasData && !uploadBusy && (
                <div className="rounded-xl border border-dashed border-surface-border bg-surface-raised/40 p-8 text-center fade-in">
                  <p className="text-sm text-zinc-400">No dataset loaded yet.</p>
                  <button
                    type="button"
                    onClick={() => setView("upload")}
                    className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-muted"
                  >
                    Upload CSV
                  </button>
                </div>
              )}

              {hasData && (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-surface-border bg-surface-raised/70 p-4 shadow-panel">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Questions asked</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{historyEntries.length}</div>
                    </div>
                    <div className="rounded-xl border border-surface-border bg-surface-raised/70 p-4 shadow-panel">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Preview rows loaded</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{previewRows.length}</div>
                    </div>
                    <div className="rounded-xl border border-surface-border bg-surface-raised/70 p-4 shadow-panel">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">AI status</div>
                      <div className="mt-2 text-base font-semibold text-white">{apiOk ? "Connected" : "Check backend key"}</div>
                    </div>
                  </div>
                  <DatasetSummary
                    rowCount={rowCount}
                    columnCount={columnCount}
                    columns={columns}
                    fileName={fileName}
                  />
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-zinc-300">Data preview</h3>
                    <DataTable columns={tableColumns} rows={previewRows} />
                    {rowCount > previewRows.length && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Showing first {previewRows.length} of {rowCount.toLocaleString()} rows (full file is on the
                        server).
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-zinc-300">Analyst</h3>
                    <ChatPanel
                      messages={messages}
                      input={chatInput}
                      onInput={setChatInput}
                      onSend={sendMessage}
                      loading={queryLoading}
                      disabledSend={!uploadId || !chatInput.trim()}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {view === "history" && (
            <HistoryPanel
              entries={historyEntries}
              onReuse={(question) => {
                setView("dashboard");
                setChatInput(question);
              }}
              onClear={() => setHistoryEntries([])}
            />
          )}
        </main>
      </div>
    </div>
  );
}
