import { useEffect, useState } from "react";

import { api } from "../lib/api.js";
import type { HealthResponse } from "../types.js";

const INTERNAL_ENDPOINTS = [
  {
    method: "GET",
    path: "/__simapi/health",
    description: "Server health and metadata",
  },
  {
    method: "GET",
    path: "/__simapi/endpoints",
    description: "List all registered endpoints",
  },
  {
    method: "GET",
    path: "/__simapi/logs",
    description: "Paginated request log entries",
  },
  {
    method: "GET",
    path: "/__simapi/logs/stream",
    description: "Live log stream (SSE)",
  },
  {
    method: "DELETE",
    path: "/__simapi/logs",
    description: "Clear all log entries",
  },
  {
    method: "DELETE",
    path: "/__simapi/logs/:id",
    description: "Delete a log entry by ID",
  },
  {
    method: "GET",
    path: "/__simapi/console/",
    description: "This console UI",
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900",
  POST: "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900",
  DELETE:
    "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900",
};

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
          <div className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
            {/* Server name bar */}
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

            {/* Stats row */}
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
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
            {INTERNAL_ENDPOINTS.map((ep, i) => (
              <div
                key={ep.path}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < INTERNAL_ENDPOINTS.length - 1
                    ? "border-b border-zinc-50 dark:border-zinc-800/60"
                    : ""
                }`}
              >
                <span
                  className={`w-14 text-center text-xs font-semibold px-1.5 py-0.5 rounded border shrink-0 font-mono ${METHOD_COLORS[ep.method] ?? "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-100 dark:border-zinc-700"}`}
                >
                  {ep.method}
                </span>
                <code className="text-zinc-600 dark:text-zinc-300 font-mono text-xs flex-1 truncate">
                  {ep.path}
                </code>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:block shrink-0">
                  {ep.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  sub,
  accent,
  mono,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1 font-medium">
        {label}
      </p>
      <p
        className={`text-base font-semibold leading-none ${
          accent === true
            ? "text-emerald-600 dark:text-emerald-400"
            : accent === false
              ? "text-zinc-400 dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-100"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{sub}</p>
      )}
    </div>
  );
}
