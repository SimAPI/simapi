import { useEffect, useRef, useState } from "react";
import { api } from "../../../lib/api.js";
import type { RequestLog } from "../../../types.js";
import { METHOD_COLORS } from "../_constants.js";
import { fmtHeaders, statusColor } from "../_utils.js";
import { JsonView } from "../../../components/ui/JsonView.js";

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/50 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-card-border overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-start gap-3 px-6 py-5 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded font-mono border uppercase tracking-tighter ${
                  METHOD_COLORS[log.method] ??
                  "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {log.method}
              </span>
              <code className="text-foreground font-mono text-sm font-black break-all tracking-tight">
                {log.path}
                {log.query ? (
                  <span className="text-muted-foreground/50">{log.query}</span>
                ) : null}
              </code>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              <span className={`font-mono ${statusColor(log.responseStatus)}`}>
                {log.responseStatus}
              </span>
              <span className="font-mono">{log.durationMs}ms</span>
              <span>{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-90 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
          <Section title="Request Headers">
            {headers ? (
              <div className="rounded-xl border border-border overflow-hidden">
                {Object.entries(headers).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-border/50 last:border-0 text-[11px]"
                  >
                    <span className="col-span-2 text-muted-foreground font-mono font-black uppercase tracking-tight truncate">
                      {key}
                    </span>
                    <span className="col-span-3 text-foreground font-mono break-all font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic px-2">
                No headers sent
              </p>
            )}
          </Section>

          <Section title="Request Body">
            <JsonView data={log.requestBody} title="Body" copyable={false} />
          </Section>

          <Section
            title={
              <span className="flex items-center gap-2">
                Response Body
                <span
                  className={`font-mono font-black ${statusColor(
                    log.responseStatus
                  )}`}
                >
                  {log.responseStatus}
                </span>
              </span>
            }
          >
            <JsonView
              data={log.responseBody}
              title="Response"
              copyable={false}
            />
          </Section>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/50 shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-[10px] font-black text-error hover:text-error uppercase tracking-widest disabled:opacity-50 transition-colors"
          >
            <span className="text-base leading-none">⊗</span>
            {deleting ? "Deleting…" : "Delete entry"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-border transition-colors font-black uppercase tracking-widest"
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
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}
