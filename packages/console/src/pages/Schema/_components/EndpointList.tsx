import type { EndpointInfo } from "../../../types.js";
import { METHOD_COLORS } from "../_constants.js";

export function EndpointList({
  endpoints,
  selected,
  onSelect,
}: {
  endpoints: EndpointInfo[];
  selected: EndpointInfo | null;
  onSelect: (e: EndpointInfo) => void;
}) {
  if (endpoints.length === 0) {
    return (
      <p className="px-4 py-8 text-xs text-zinc-400 dark:text-zinc-500 text-center">
        No endpoints discovered.
      </p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {endpoints.map((endpoint) => {
        const isSelected =
          selected?.path === endpoint.path &&
          selected.method === endpoint.method;
        return (
          <button
            key={`${endpoint.method}-${endpoint.path}`}
            type="button"
            onClick={() => onSelect(endpoint)}
            className={`w-full flex items-start gap-2 px-3 py-3 sm:py-2.5 text-left transition-colors border-r-2 active:bg-zinc-100 dark:active:bg-zinc-800 ${
              isSelected
                ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-500"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-transparent"
            }`}
          >
            <span
              className={`mt-0.5 w-12 text-center text-[10px] font-bold px-1 py-0.5 rounded border font-mono shrink-0 ${METHOD_COLORS[endpoint.method] ?? "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-100 dark:border-zinc-700"}`}
            >
              {endpoint.method}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono text-zinc-700 dark:text-zinc-200 truncate">
                {endpoint.path}
              </p>
              {endpoint.title && (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                  {endpoint.title}
                </p>
              )}
            </div>
            {/* Mobile chevron */}
            <span className="sm:hidden text-zinc-300 dark:text-zinc-600 text-xs mt-1 shrink-0">
              ›
            </span>
          </button>
        );
      })}
    </div>
  );
}
