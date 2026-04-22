import type { HealthResponse } from "../../../types.js";
import { StatCell } from "./StatCell.js";

export function StatusCard({ health }: { health: HealthResponse }) {
  return (
    <div className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {health.name || "SimAPI Server"}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
            v{health.version}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
            health.ok
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-900"
              : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              health.ok
                ? "bg-emerald-500 shadow-[0_0_4px] shadow-emerald-400"
                : "bg-red-500"
            }`}
          />
          {health.ok ? "Online" : "Error"}
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
        <StatCell
          label="Endpoints"
          value={String(health.endpointCount)}
          sub="registered"
        />
        <StatCell
          label="Logging"
          value={health.logging ? "Enabled" : "Disabled"}
          accent={health.logging}
        />
        <StatCell label="Version" value={`v${health.version}`} mono />
      </div>
    </div>
  );
}
