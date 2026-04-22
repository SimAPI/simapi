import type { RequestLog } from "../../../types.js";
import { METHOD_COLORS } from "../_constants.js";
import { statusColor, statusDot } from "../_utils.js";

export function LogTable({
  logs,
  onSelect,
}: {
  logs: RequestLog[];
  onSelect: (log: RequestLog) => void;
}) {
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 z-10">
        <tr className="text-left text-xs text-muted-foreground bg-background/90 backdrop-blur-sm border-b border-border">
          <th className="hidden sm:table-cell px-4 py-3 font-black uppercase tracking-widest w-32">
            Time
          </th>
          <th className="px-3 sm:px-4 py-3 font-black uppercase tracking-widest w-16 sm:w-20">
            Method
          </th>
          <th className="px-3 sm:px-4 py-3 font-black uppercase tracking-widest">
            Path
          </th>
          <th className="px-3 sm:px-4 py-3 font-black uppercase tracking-widest w-16 sm:w-20">
            Status
          </th>
          <th className="hidden sm:table-cell px-4 py-3 font-black uppercase tracking-widest text-right w-16">
            ms
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border bg-card">
        {logs.map((log) => (
          <tr
            key={log.id}
            onClick={() => onSelect(log)}
            className="hover:bg-secondary/50 active:bg-secondary cursor-pointer transition-colors"
          >
            <td className="hidden sm:table-cell px-4 py-2.5 text-muted-foreground font-mono text-xs whitespace-nowrap">
              {new Date(log.timestamp).toLocaleTimeString()}
            </td>
            <td className="px-3 sm:px-4 py-2.5">
              <span
                className={`text-[10px] sm:text-xs font-black px-1 sm:px-1.5 py-0.5 rounded font-mono border ${
                  METHOD_COLORS[log.method] ??
                  "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {log.method}
              </span>
            </td>
            <td className="px-3 sm:px-4 py-2.5 text-foreground font-mono text-xs max-w-0 truncate">
              {log.path}
              {log.query && (
                <span className="text-muted-foreground/50">{log.query}</span>
              )}
            </td>
            <td className="px-3 sm:px-4 py-2.5">
              <span
                className={`inline-flex items-center gap-1 sm:gap-1.5 font-black font-mono text-xs ${statusColor(
                  log.responseStatus
                )}`}
              >
                <span
                  className={`size-1.5 rounded-full shrink-0 ${statusDot(
                    log.responseStatus
                  )}`}
                />
                {log.responseStatus}
              </span>
            </td>
            <td className="hidden sm:table-cell px-4 py-2.5 text-muted-foreground font-mono text-xs text-right">
              {log.durationMs}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
