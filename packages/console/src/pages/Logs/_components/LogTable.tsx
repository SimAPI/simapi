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
        {logs.map((log) => (
          <tr
            key={log.id}
            onClick={() => onSelect(log)}
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
  );
}
