import { useEffect, useRef, useState } from "react";

import { api, connectSSE } from "../lib/api.js";
import type { RequestLog } from "../types.js";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
  POST: "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300",
  PUT: "bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300",
  PATCH:
    "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300",
  DELETE: "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300",
};

function statusColor(s: number): string {
  if (s >= 500) return "text-red-500 dark:text-red-400";
  if (s >= 400) return "text-yellow-500 dark:text-yellow-400";
  if (s >= 300) return "text-blue-500 dark:text-blue-400";
  return "text-emerald-500 dark:text-emerald-400";
}

function statusDot(s: number): string {
  if (s >= 500) return "bg-red-400";
  if (s >= 400) return "bg-yellow-400";
  if (s >= 300) return "bg-blue-400";
  return "bg-emerald-400";
}

function fmtJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s || "(empty)";
  }
}

function fmtHeaders(s: string): Record<string, string> | null {
  try {
    return JSON.parse(s) as Record<string, string>;
  } catch {
    return null;
  }
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function genPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Clear All PIN modal ───────────────────────────────────────────────────────

function ClearLogsModal({
  pin,
  count,
  onConfirm,
  onClose,
}: {
  pin: string;
  count: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleConfirm = async () => {
    setClearing(true);
    try {
      await onConfirm();
    } finally {
      setClearing(false);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop
    <div
      ref={overlayRef}
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-red-500 text-lg leading-none">⊗</span>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              Clear all logs
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {count} {count === 1 ? "entry" : "entries"}
            </span>
            . This cannot be undone.
          </p>
        </div>

        {/* PIN display */}
        <div className="px-5 py-5 space-y-4">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Confirmation PIN
            </p>
            <p className="font-mono text-3xl font-bold tracking-[0.25em] text-zinc-900 dark:text-zinc-100">
              {pin}
            </p>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
              Enter PIN to confirm
            </label>
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input === pin) handleConfirm();
              }}
              placeholder="______"
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-center font-mono text-lg tracking-[0.25em] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 dark:focus:border-red-600 transition-colors placeholder-zinc-300 dark:placeholder-zinc-700"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={input !== pin || clearing}
              className="flex-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-400 active:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
            >
              {clearing ? "Clearing…" : "Clear All Logs"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Log detail modal ─────────────────────────────────────────────────────────

function LogModal({
  log,
  onClose,
  onDelete,
}: {
  log: RequestLog;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [deleting, setDeleting] = useState(false);
  const headers = fmtHeaders(log.requestHeaders);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteLog(log.id);
      onDelete(log.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop — Escape handled by useEffect, click-outside is a UX pattern
    <div
      ref={overlayRef}
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${METHOD_COLORS[log.method] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}
              >
                {log.method}
              </span>
              <code className="text-zinc-800 dark:text-zinc-200 font-mono text-sm font-medium break-all">
                {log.path}
                {log.query ? (
                  <span className="text-zinc-400 dark:text-zinc-500">
                    {log.query}
                  </span>
                ) : null}
              </code>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span
                className={`font-semibold font-mono ${statusColor(log.responseStatus)}`}
              >
                {log.responseStatus}
              </span>
              <span className="font-mono">{log.durationMs}ms</span>
              <span>{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Section title="Request Headers">
            {headers ? (
              <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                {Object.entries(headers).map(([k, v]) => (
                  <div
                    key={k}
                    className="grid grid-cols-5 gap-2 px-3 py-2 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 text-xs"
                  >
                    <span className="col-span-2 text-zinc-500 dark:text-zinc-400 font-mono truncate">
                      {k}
                    </span>
                    <span className="col-span-3 text-zinc-700 dark:text-zinc-300 font-mono break-all">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <CodeBlock content={log.requestHeaders || "(none)"} />
            )}
          </Section>

          <Section title="Request Body">
            <CodeBlock content={fmtJson(log.requestBody)} />
          </Section>

          <Section
            title={
              <span className="flex items-center gap-2">
                Response Body
                <span
                  className={`font-mono font-semibold ${statusColor(log.responseStatus)}`}
                >
                  {log.responseStatus}
                </span>
              </span>
            }
          >
            <CodeBlock content={fmtJson(log.responseBody)} />
          </Section>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            <span className="text-base leading-none">⊗</span>
            {deleting ? "Deleting…" : "Delete entry"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-3 overflow-auto max-h-52 whitespace-pre-wrap">
      {content}
    </pre>
  );
}

// ─── Main Logs page ───────────────────────────────────────────────────────────

export default function Logs() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [selected, setSelected] = useState<RequestLog | null>(null);
  const [filter, setFilter] = useState("");
  const [clearPin, setClearPin] = useState<string | null>(null);

  useEffect(() => {
    api
      .logs(200)
      .then((r) => setLogs(r.data))
      .catch(console.error);
    const disconnect = connectSSE((entry) => {
      setLogs((prev) => [entry, ...prev].slice(0, 500));
    });
    return disconnect;
  }, []);

  const filtered = filter
    ? logs.filter(
        (l) =>
          l.path.includes(filter) ||
          l.method.toLowerCase().startsWith(filter.toLowerCase())
      )
    : logs;

  const exportJson = () => {
    downloadBlob(
      JSON.stringify(filtered, null, 2),
      "simapi-logs.json",
      "application/json"
    );
  };

  const handleDelete = (id: number) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleClearAll = async () => {
    await api.clearLogs();
    setLogs([]);
    setClearPin(null);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-900 shrink-0">
        <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 mr-1">
          Request Logs
        </h1>
        <input
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 min-w-0 flex-1 sm:flex-none sm:w-48 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors"
          placeholder="Filter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          type="button"
          onClick={exportJson}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors font-medium whitespace-nowrap"
        >
          Export
        </button>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => setClearPin(genPin())}
            className="text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300 px-3 py-1.5 border border-red-200 dark:border-red-900/60 rounded-lg hover:border-red-300 dark:hover:border-red-800 transition-colors font-medium whitespace-nowrap"
          >
            Clear All
          </button>
        )}
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono ml-auto">
          {filtered.length} entries
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
              <th className="hidden sm:table-cell px-4 py-2.5 font-medium w-32">
                Time
              </th>
              <th className="px-3 sm:px-4 py-2.5 font-medium w-16 sm:w-20">
                Method
              </th>
              <th className="px-3 sm:px-4 py-2.5 font-medium">Path</th>
              <th className="px-3 sm:px-4 py-2.5 font-medium w-16 sm:w-20">
                Status
              </th>
              <th className="hidden sm:table-cell px-4 py-2.5 font-medium text-right w-16">
                ms
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-20 text-center">
                  <p className="text-zinc-300 dark:text-zinc-600 text-3xl mb-3">
                    ≡
                  </p>
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                    {filter
                      ? "No entries match your filter."
                      : "No requests logged yet — make a request to your API."}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelected(log)}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-800 cursor-pointer transition-colors"
              >
                <td className="hidden sm:table-cell px-4 py-2.5 text-zinc-400 dark:text-zinc-500 font-mono text-xs whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-3 sm:px-4 py-2.5">
                  <span
                    className={`text-[10px] sm:text-xs font-semibold px-1 sm:px-1.5 py-0.5 rounded font-mono ${METHOD_COLORS[log.method] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}
                  >
                    {log.method}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-zinc-600 dark:text-zinc-300 font-mono text-xs max-w-0 truncate">
                  {log.path}
                  {log.query && (
                    <span className="text-zinc-400 dark:text-zinc-500">
                      {log.query}
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-4 py-2.5">
                  <span
                    className={`inline-flex items-center gap-1 sm:gap-1.5 font-semibold font-mono text-xs ${statusColor(log.responseStatus)}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(log.responseStatus)}`}
                    />
                    {log.responseStatus}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-4 py-2.5 text-zinc-400 dark:text-zinc-500 font-mono text-xs text-right">
                  {log.durationMs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log detail modal */}
      {selected && (
        <LogModal
          log={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Clear All PIN confirmation modal */}
      {clearPin && (
        <ClearLogsModal
          pin={clearPin}
          count={logs.length}
          onConfirm={handleClearAll}
          onClose={() => setClearPin(null)}
        />
      )}
    </div>
  );
}
