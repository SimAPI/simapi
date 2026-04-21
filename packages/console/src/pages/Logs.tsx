import { useEffect, useRef, useState } from "react";

import { api, connectSSE } from "../lib/api.js";
import type { RequestLog } from "../types.js";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  POST: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  PUT: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
  PATCH:
    "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  DELETE: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
};

function statusColor(s: number): string {
  if (s >= 500) return "text-red-500 dark:text-red-400";
  if (s >= 400) return "text-yellow-600 dark:text-yellow-400";
  if (s >= 300) return "text-blue-600 dark:text-blue-400";
  return "text-emerald-600 dark:text-emerald-400";
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
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
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
              <code className="text-zinc-800 dark:text-zinc-200 font-mono text-sm font-medium truncate">
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
                className={`font-semibold ${statusColor(log.responseStatus)}`}
              >
                {log.responseStatus}
              </span>
              <span>{log.durationMs}ms</span>
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
          {/* Request Headers */}
          <Section title="Request Headers">
            {headers ? (
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(headers).map(([k, v]) => (
                    <tr
                      key={k}
                      className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <td className="py-1.5 pr-4 text-zinc-500 dark:text-zinc-400 font-mono w-2/5 align-top">
                        {k}
                      </td>
                      <td className="py-1.5 text-zinc-700 dark:text-zinc-300 font-mono break-all">
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {log.requestHeaders || "(none)"}
              </pre>
            )}
          </Section>

          {/* Request Body */}
          <Section title="Request Body">
            <CodeBlock content={fmtJson(log.requestBody)} />
          </Section>

          {/* Response */}
          <Section
            title={
              <span className="flex items-center gap-2">
                Response Body
                <span
                  className={`font-semibold ${statusColor(log.responseStatus)}`}
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
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            <span className="text-base leading-none">⊗</span>
            {deleting ? "Deleting…" : "Delete entry"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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
    <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-3 overflow-auto max-h-52 whitespace-pre-wrap">
      {content}
    </pre>
  );
}

// ─── Main Logs page ───────────────────────────────────────────────────────────

export default function Logs() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [selected, setSelected] = useState<RequestLog | null>(null);
  const [filter, setFilter] = useState("");

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

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900 shrink-0">
        <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 mr-2">
          Request Logs
        </h1>
        <input
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 w-52 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors"
          placeholder="Filter path or method…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          type="button"
          onClick={exportJson}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
        >
          Export JSON
        </button>
        <span className="text-xs text-zinc-400 dark:text-zinc-600 ml-auto font-mono">
          {filtered.length} entries
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-2.5 font-medium">Time</th>
              <th className="px-4 py-2.5 font-medium">Method</th>
              <th className="px-4 py-2.5 font-medium">Path</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">ms</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-16 text-center text-zinc-400 dark:text-zinc-600 text-sm"
                >
                  {filter
                    ? "No entries match your filter."
                    : "No requests logged yet — make a request to your API."}
                </td>
              </tr>
            )}
            {filtered.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelected(log)}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5 text-zinc-400 dark:text-zinc-500 font-mono text-xs whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${METHOD_COLORS[log.method] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}
                  >
                    {log.method}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                  {log.path}
                  {log.query && (
                    <span className="text-zinc-400 dark:text-zinc-600">
                      {log.query}
                    </span>
                  )}
                </td>
                <td
                  className={`px-4 py-2.5 font-semibold font-mono text-xs ${statusColor(log.responseStatus)}`}
                >
                  {log.responseStatus}
                </td>
                <td className="px-4 py-2.5 text-zinc-400 dark:text-zinc-600 font-mono text-xs text-right">
                  {log.durationMs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <LogModal
          log={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
