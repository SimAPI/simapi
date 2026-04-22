import { INTERNAL_ENDPOINTS, METHOD_COLORS } from "../_constants.js";

export function InternalApiList() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm dark:shadow-none">
      {INTERNAL_ENDPOINTS.map((endpoint, index) => (
        <div
          key={endpoint.path}
          className={`flex items-center gap-3 px-4 py-3 ${
            index < INTERNAL_ENDPOINTS.length - 1
              ? "border-b border-border/50"
              : ""
          }`}
        >
          <span
            className={`w-14 text-center text-xs font-black px-1.5 py-0.5 rounded border shrink-0 font-mono ${
              METHOD_COLORS[endpoint.method] ??
              "bg-secondary text-muted-foreground border-border"
            }`}
          >
            {endpoint.method}
          </span>
          <code className="text-foreground/80 font-mono text-xs flex-1 truncate">
            {endpoint.path}
          </code>
          <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
            {endpoint.description}
          </span>
        </div>
      ))}
    </div>
  );
}
