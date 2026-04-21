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
    description: "Live log stream (Server-Sent Events)",
  },
  {
    method: "DELETE",
    path: "/__simapi/logs/:id",
    description: "Delete a log entry by ID",
  },
  { method: "GET", path: "/__simapi/console/", description: "This console UI" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  POST: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  DELETE: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
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
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Overview
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Server status and available internal endpoints.
        </p>
      </div>

      {/* Server card */}
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-5 py-4">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">
            Cannot reach /__simapi/health — is the SimAPI server running?
          </p>
        </div>
      ) : health ? (
        <div className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                {health.name || "SimAPI Server"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                v{health.version}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                health.ok
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${health.ok ? "bg-emerald-500" : "bg-red-500"}`}
              />
              {health.ok ? "Online" : "Error"}
            </span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
            <Stat label="Endpoints" value={String(health.endpointCount)} />
            <Stat
              label="Logging"
              value={health.logging ? "Enabled" : "Disabled"}
              accent={health.logging}
            />
            <Stat label="Version" value={`v${health.version}`} mono />
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-8 text-center">
          <p className="text-zinc-400 dark:text-zinc-600 text-sm">
            Connecting to server…
          </p>
        </div>
      )}

      {/* Internal endpoints */}
      <div>
        <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
          Internal API
        </h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
          {INTERNAL_ENDPOINTS.map((ep, i) => (
            <div
              key={ep.path}
              className={`flex items-center gap-4 px-4 py-3 ${
                i < INTERNAL_ENDPOINTS.length - 1
                  ? "border-b border-zinc-100 dark:border-zinc-800"
                  : ""
              }`}
            >
              <span
                className={`w-16 text-center text-xs font-semibold px-2 py-0.5 rounded shrink-0 font-mono ${METHOD_COLORS[ep.method] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}
              >
                {ep.method}
              </span>
              <code className="text-zinc-700 dark:text-zinc-300 font-mono text-xs flex-1">
                {ep.path}
              </code>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 text-right hidden sm:block">
                {ep.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">{label}</p>
      <p
        className={`text-sm font-semibold ${
          accent === true
            ? "text-emerald-600 dark:text-emerald-400"
            : accent === false
              ? "text-zinc-400 dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-100"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
