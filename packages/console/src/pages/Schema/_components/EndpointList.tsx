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
    <div className="flex-1 overflow-y-auto py-8 bg-background/50 scrollbar-none">
      <div className="px-8 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] select-none">
            Endpoints
          </span>
          <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
            {endpoints.length} Routes
          </span>
        </div>
      </div>

      <div className="px-4 space-y-1">
        {endpoints.map((endpoint) => {
          const isSelected =
            selected?.path === endpoint.path &&
            selected.method === endpoint.method;
          return (
            <button
              key={`${endpoint.method}-${endpoint.path}`}
              type="button"
              onClick={() => onSelect(endpoint)}
              className={`w-full group relative flex flex-col p-4 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? "bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-card-border"
                  : "hover:bg-secondary/50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black font-mono border transition-all duration-500 uppercase tracking-tighter ${
                    isSelected
                      ? METHOD_COLORS[endpoint.method] ||
                        "bg-secondary border-border"
                      : "bg-secondary text-muted-foreground/60 border-border/50"
                  }`}
                >
                  {endpoint.method}
                </span>
                <p
                  className={`text-[13px] font-mono truncate tracking-tight transition-colors duration-300 ${
                    isSelected
                      ? "text-foreground font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {endpoint.path}
                </p>
              </div>

              {endpoint.title && (
                <p
                  className={`text-[11px] truncate leading-tight transition-colors duration-300 pl-px ${
                    isSelected
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {endpoint.title}
                </p>
              )}

              {isSelected && (
                <div className="absolute -left-1 top-4 bottom-4 w-1 bg-primary rounded-full blur-[1px]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
