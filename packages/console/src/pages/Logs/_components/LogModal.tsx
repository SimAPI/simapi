import { useEffect, useRef, useState } from "react";
import { api } from "../../../lib/api.js";
import type { RequestLog } from "../../../types.js";
import { METHOD_COLORS } from "../_constants.js";
import { fmtHeaders, fmtJson, statusColor } from "../_utils.js";

export function LogModal({
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
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
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
    // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop
    <div
      ref={overlayRef}
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col max-h-[85vh]">
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

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Section title="Request Headers">
            {headers ? (
              <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                {Object.entries(headers).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-5 gap-2 px-3 py-2 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 text-xs"
                  >
                    <span className="col-span-2 text-zinc-500 dark:text-zinc-400 font-mono truncate">
                      {key}
                    </span>
                    <span className="col-span-3 text-zinc-700 dark:text-zinc-300 font-mono break-all">
                      {value}
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
