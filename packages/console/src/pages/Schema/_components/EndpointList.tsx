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
    <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
      <div className="px-5 mb-4">
        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
          Endpoints
        </span>
      </div>
      <div className="space-y-0.5">
        {endpoints.map((endpoint) => {
          const isSelected =
            selected?.path === endpoint.path &&
            selected.method === endpoint.method;
          return (
            <button
              key={`${endpoint.method}-${endpoint.path}`}
              type="button"
              onClick={() => onSelect(endpoint)}
              className={`w-full flex items-start gap-4 px-5 py-3 text-left transition-all relative group ${
                isSelected
                  ? "bg-white dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20"
              }`}
            >
              {isSelected && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-500 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              )}
              <span
                className={`mt-0.5 w-14 text-center text-[9px] font-black px-1.5 py-0.5 rounded-md border font-mono shrink-0 uppercase tracking-tight transition-colors ${
                  isSelected
                    ? (METHOD_COLORS[endpoint.method] ??
                      "bg-zinc-100 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600")
                    : "bg-transparent border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                }`}
              >
                {endpoint.method}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p
                  className={`text-[12px] font-mono truncate tracking-tight transition-colors ${
                    isSelected
                      ? "font-bold text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {endpoint.path}
                </p>
                {endpoint.title && (
                  <p
                    className={`text-[10px] truncate leading-tight transition-colors ${
                      isSelected
                        ? "text-zinc-500 dark:text-zinc-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {endpoint.title}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
