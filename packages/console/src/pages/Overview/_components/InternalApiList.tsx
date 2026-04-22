import { INTERNAL_ENDPOINTS, METHOD_COLORS } from "../_constants.js";

export function InternalApiList() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
      {INTERNAL_ENDPOINTS.map((endpoint, index) => (
        <div
          key={endpoint.path}
          className={`flex items-center gap-3 px-4 py-3 ${
            index < INTERNAL_ENDPOINTS.length - 1
              ? "border-b border-zinc-50 dark:border-zinc-800/60"
              : ""
          }`}
        >
          <span
            className={`w-14 text-center text-xs font-semibold px-1.5 py-0.5 rounded border shrink-0 font-mono ${METHOD_COLORS[endpoint.method] ?? "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-100 dark:border-zinc-700"}`}
          >
            {endpoint.method}
          </span>
          <code className="text-zinc-600 dark:text-zinc-300 font-mono text-xs flex-1 truncate">
            {endpoint.path}
          </code>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:block shrink-0">
            {endpoint.description}
          </span>
        </div>
      ))}
    </div>
  );
}
