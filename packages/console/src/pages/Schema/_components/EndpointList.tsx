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
    <div className="flex-1 overflow-y-auto py-2">
      {endpoints.map((endpoint) => {
        const isSelected =
          selected?.path === endpoint.path &&
          selected.method === endpoint.method;
        return (
          <button
            key={`${endpoint.method}-${endpoint.path}`}
            type="button"
            onClick={() => onSelect(endpoint)}
            className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-l-2 ${
              isSelected
                ? "bg-zinc-100 dark:bg-zinc-800/40 border-cyan-500"
                : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-transparent"
            }`}
          >
            <span
              className={`mt-0.5 w-12 text-center text-[10px] font-black px-1.5 py-0.5 rounded border font-mono shrink-0 uppercase tracking-tighter ${
                METHOD_COLORS[endpoint.method] ??
                "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-100 dark:border-zinc-700"
              }`}
            >
              {endpoint.method}
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className={`text-[13px] font-mono truncate ${isSelected ? "text-zinc-900 dark:text-zinc-100 font-bold" : "text-zinc-600 dark:text-zinc-400"}`}>
                {endpoint.path}
              </p>
              {endpoint.title && (
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate leading-tight">
                  {endpoint.title}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
