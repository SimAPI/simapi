import { useEffect, useState } from "react";

import { api } from "../lib/api.js";
import type { EndpointInfo, HealthResponse } from "../types.js";

const METHOD_COLOR: Record<string, string> = {
  GET: "bg-blue-950 text-blue-300",
  POST: "bg-green-950 text-green-300",
  PUT: "bg-yellow-950 text-yellow-300",
  PATCH: "bg-orange-950 text-orange-300",
  DELETE: "bg-red-950 text-red-300",
};

function buildOpenApi(name: string, endpoints: EndpointInfo[]): object {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const e of endpoints) {
    const p = e.path.replace(/:(\w+)/g, "{$1}");
    if (!paths[p]) paths[p] = {};
    const urlParams = (e.path.match(/:(\w+)/g) ?? []).map((m) => ({
      in: "path",
      name: m.slice(1),
      required: true,
      schema: { type: "string" },
    }));

    paths[p][e.method.toLowerCase()] = {
      ...(urlParams.length > 0 ? { parameters: urlParams } : {}),
      ...(e.type === "secure" ? { security: [{ bearerAuth: [] }] } : {}),
      responses: { "200": { description: "Success" } },
    };
  }

  return {
    openapi: "3.0.0",
    info: { title: name, version: "0.1.0" },
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
  };
}

export default function Schema() {
  const [endpoints, setEndpoints] = useState<EndpointInfo[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    Promise.all([api.endpoints(), api.health()])
      .then(([eps, h]) => {
        setEndpoints(eps);
        setHealth(h);
      })
      .catch(console.error);
  }, []);

  const exportOpenApi = () => {
    if (!health) return;
    const spec = buildOpenApi(health.name, endpoints);
    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "openapi.json";
    a.click();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-zinc-400">
          {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}
        </h2>
        <button
          type="button"
          onClick={exportOpenApi}
          disabled={!health}
          className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1.5 border border-zinc-700 rounded transition-colors disabled:opacity-40"
        >
          Export OpenAPI 3
        </button>
      </div>

      <div className="space-y-2">
        {endpoints.map((e) => (
          <div
            key={`${e.method}-${e.path}`}
            className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
          >
            <span
              className={`w-16 text-center text-xs font-medium px-2 py-0.5 rounded shrink-0 ${METHOD_COLOR[e.method] ?? "bg-zinc-800 text-zinc-300"}`}
            >
              {e.method}
            </span>
            <span className="text-zinc-200 font-mono flex-1">{e.path}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                e.type === "secure"
                  ? "border-yellow-800 text-yellow-500"
                  : "border-zinc-700 text-zinc-500"
              }`}
            >
              {e.type}
            </span>
          </div>
        ))}

        {endpoints.length === 0 && (
          <p className="text-zinc-600 text-sm">
            No endpoints discovered in endpoints/
          </p>
        )}
      </div>
    </div>
  );
}
