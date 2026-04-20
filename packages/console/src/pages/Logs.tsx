import { useEffect, useState } from "react";

import { api, connectSSE } from "../lib/api.js";
import type { RequestLog } from "../types.js";

interface LogEntry extends RequestLog {
  _id: number;
}

let _seq = 0;
function stamp(log: RequestLog): LogEntry {
  return { ...log, _id: _seq++ };
}

const METHOD_COLOR: Record<string, string> = {
  GET: "bg-blue-950 text-blue-300",
  POST: "bg-green-950 text-green-300",
  PUT: "bg-yellow-950 text-yellow-300",
  PATCH: "bg-orange-950 text-orange-300",
  DELETE: "bg-red-950 text-red-300",
};

function statusColor(s: number): string {
  if (s >= 500) return "text-red-400";
  if (s >= 400) return "text-yellow-400";
  if (s >= 300) return "text-blue-400";
  return "text-green-400";
}

function fmtJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api
      .logs(200)
      .then((r) => setLogs(r.data.map(stamp)))
      .catch(console.error);
    const disconnect = connectSSE((entry) => {
      setLogs((prev) => [stamp(entry), ...prev].slice(0, 500));
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 w-56 focus:outline-none focus:border-zinc-500"
          placeholder="Filter by path or method…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          type="button"
          onClick={exportJson}
          className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1.5 border border-zinc-700 rounded transition-colors"
        >
          Export JSON
        </button>
        <span className="text-xs text-zinc-600 ml-auto">
          {filtered.length} entries
        </span>
      </div>

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-800 bg-zinc-900/80">
              <th className="px-4 py-2 font-normal">Time</th>
              <th className="px-4 py-2 font-normal">Method</th>
              <th className="px-4 py-2 font-normal">Path</th>
              <th className="px-4 py-2 font-normal">Status</th>
              <th className="px-4 py-2 font-normal">ms</th>
              <th className="px-4 py-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-zinc-600"
                >
                  No entries yet — make a request to your API
                </td>
              </tr>
            )}
            {filtered.map((log) => (
              <>
                <tr
                  key={log._id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/40"
                >
                  <td className="px-4 py-2 text-zinc-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${METHOD_COLOR[log.method] ?? "bg-zinc-800 text-zinc-300"}`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-300 font-mono">
                    {log.path}
                  </td>
                  <td
                    className={`px-4 py-2 font-medium ${statusColor(log.responseStatus)}`}
                  >
                    {log.responseStatus}
                  </td>
                  <td className="px-4 py-2 text-zinc-600">{log.durationMs}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(expanded === log._id ? null : log._id)
                      }
                      className="text-zinc-600 hover:text-zinc-300 px-1 transition-colors"
                      aria-label={expanded === log._id ? "Collapse" : "Expand"}
                    >
                      {expanded === log._id ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>
                {expanded === log._id && (
                  <tr
                    key={`${log._id}-detail`}
                    className="bg-zinc-900/30 border-b border-zinc-800/50"
                  >
                    <td colSpan={6} className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-zinc-500 mb-1 text-xs">
                            Request body
                          </p>
                          <pre className="text-zinc-300 overflow-auto max-h-40 bg-zinc-950 rounded p-2 text-xs">
                            {fmtJson(log.requestBody)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-zinc-500 mb-1 text-xs">
                            Response body
                          </p>
                          <pre className="text-zinc-300 overflow-auto max-h-40 bg-zinc-950 rounded p-2 text-xs">
                            {fmtJson(log.responseBody)}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
