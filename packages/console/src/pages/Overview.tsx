import { useEffect, useState } from "react";

import { api } from "../lib/api.js";
import type { HealthResponse } from "../types.js";

export default function Overview() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="text-red-400 text-sm">
        Could not reach /__simapi/health — is the server running?
      </p>
    );
  }

  if (!health) {
    return <p className="text-zinc-500">Loading…</p>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-xl font-semibold text-zinc-100">{health.name}</h1>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="SimAPI" value={`v${health.version}`} />
        <Stat label="Endpoints" value={String(health.endpointCount)} />
        <Stat
          label="Logging"
          value={health.logging ? "enabled" : "disabled"}
          muted={!health.logging}
        />
      </div>

      <div
        className={`text-xs px-3 py-2 rounded border ${
          health.ok
            ? "border-green-800 bg-green-950 text-green-400"
            : "border-red-800 bg-red-950 text-red-400"
        }`}
      >
        Server status: {health.ok ? "✓ ok" : "✗ error"}
      </div>

      <p className="text-xs text-zinc-600">
        Internal API available at /__simapi/*
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p
        className={`text-base font-semibold ${muted ? "text-zinc-500" : "text-zinc-100"}`}
      >
        {value}
      </p>
    </div>
  );
}
