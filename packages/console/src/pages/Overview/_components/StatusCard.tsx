import type { HealthResponse } from "../../../types.js";
import { StatCell } from "./StatCell.js";

export function StatusCard({ health }: { health: HealthResponse }) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card overflow-hidden shadow-sm dark:shadow-none">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-black text-foreground uppercase tracking-tight truncate">
            {health.name || "SimAPI Server"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono font-black tracking-widest">
            VERSION {health.version}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shrink-0 border ${
            health.ok
              ? "bg-success/5 text-success border-success/10"
              : "bg-error/5 text-error border-error/10"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              health.ok
                ? "bg-success shadow-[0_0_8px_var(--color-success)]"
                : "bg-error shadow-[0_0_8px_var(--color-error)]"
            }`}
          />
          {health.ok ? "Healthy" : "System Error"}
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border">
        <StatCell
          label="Endpoints"
          value={String(health.endpointCount)}
          sub="LIVE INTERFACES"
        />
        <StatCell
          label="Engine"
          value={health.logging ? "Active" : "Idle"}
          accent={health.logging}
        />
        <StatCell label="Runtime" value="Node.js" mono />
      </div>
    </div>
  );
}
