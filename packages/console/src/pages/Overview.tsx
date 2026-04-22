import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import type { HealthResponse } from "../types.js";
import { InternalApiList } from "./Overview/_components/InternalApiList.js";
import { StatusCard } from "./Overview/_components/StatusCard.js";

export default function Overview() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 sm:p-8 max-w-2xl">
        <div className="mb-7">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Server status and internal API reference.
          </p>
        </div>

        {/* Server status */}
        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-5 py-4 flex items-start gap-3">
            <span className="text-red-500 text-base mt-0.5 shrink-0">⊗</span>
            <div>
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                Cannot connect to SimAPI server
              </p>
              <p className="text-red-500 dark:text-red-500 text-xs mt-0.5">
                Is the server running? Check that{" "}
                <code className="font-mono">/__simapi/health</code> is
                reachable.
              </p>
            </div>
          </div>
        ) : health ? (
          <StatusCard health={health} />
        ) : (
          <div className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-8 text-center">
            <div className="inline-block w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              Connecting to server…
            </p>
          </div>
        )}

        {/* Internal endpoints */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Internal API
          </h2>
          <InternalApiList />
        </div>
      </div>
    </div>
  );
}
