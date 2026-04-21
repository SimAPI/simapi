import { useEffect, useState } from "react";

import { api } from "../lib/api.js";
import type { EndpointInfo, JsonSchemaProperty } from "../types.js";

// ─── constants ────────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  POST: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  PUT: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  PATCH:
    "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  DELETE:
    "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};

const METHOD_ACCENT: Record<string, string> = {
  GET: "text-blue-600 dark:text-blue-400",
  POST: "text-green-600 dark:text-green-400",
  PUT: "text-yellow-600 dark:text-yellow-400",
  PATCH: "text-orange-600 dark:text-orange-400",
  DELETE: "text-red-600 dark:text-red-400",
};

const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

// ─── helpers ──────────────────────────────────────────────────────────────────

function extractPathParams(path: string): string[] {
  return (path.match(/:(\w+)/g) ?? []).map((m) => m.slice(1));
}

function fmtJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

function typeLabel(prop: JsonSchemaProperty): string {
  if (!prop.type) return "unknown";
  if (prop.type === "array" && prop.items) return `${typeLabel(prop.items)}[]`;
  return prop.type;
}

function statusColor(s: number): string {
  if (s >= 500) return "text-red-500 dark:text-red-400";
  if (s >= 400) return "text-yellow-600 dark:text-yellow-400";
  return "text-emerald-600 dark:text-emerald-400";
}

// ─── Schema field row ─────────────────────────────────────────────────────────

function SchemaField({
  name,
  prop,
  required,
}: {
  name: string;
  prop: JsonSchemaProperty;
  required: boolean;
}) {
  const constraints: string[] = [];
  if (prop.minLength !== undefined) constraints.push(`min ${prop.minLength}`);
  if (prop.maxLength !== undefined) constraints.push(`max ${prop.maxLength}`);
  if (prop.minimum !== undefined) constraints.push(`≥ ${prop.minimum}`);
  if (prop.maximum !== undefined) constraints.push(`≤ ${prop.maximum}`);
  if (prop.format) constraints.push(prop.format);

  return (
    <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0 items-baseline">
      <div className="col-span-4 font-mono text-sm text-zinc-800 dark:text-zinc-200">
        {name}
        {required && (
          <span className="text-red-500 dark:text-red-400 ml-0.5 text-xs">
            *
          </span>
        )}
      </div>
      <div className="col-span-3 font-mono text-xs text-cyan-700 dark:text-cyan-400">
        {typeLabel(prop)}
      </div>
      <div className="col-span-2">
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            required
              ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {required ? "required" : "optional"}
        </span>
      </div>
      <div className="col-span-3 text-xs text-zinc-400 dark:text-zinc-500">
        {constraints.join(", ")}
      </div>
    </div>
  );
}

// ─── Try-it panel ─────────────────────────────────────────────────────────────

function TryPanel({ endpoint }: { endpoint: EndpointInfo }) {
  const pathParamNames = extractPathParams(endpoint.path);
  const [pathParams, setPathParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(pathParamNames.map((p) => [p, ""]))
  );
  const [queryRows, setQueryRows] = useState<[string, string][]>([["", ""]]);
  const [bodyText, setBodyText] = useState(() => {
    if (!BODY_METHODS.has(endpoint.method) || !endpoint.schema?.properties)
      return "{}";
    const example: Record<string, unknown> = {};
    for (const [k, prop] of Object.entries(endpoint.schema.properties)) {
      example[k] =
        prop.type === "number" || prop.type === "integer"
          ? 0
          : prop.type === "boolean"
            ? false
            : "";
    }
    return JSON.stringify(example, null, 2);
  });
  const [response, setResponse] = useState<{
    status: number;
    body: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const names = extractPathParams(endpoint.path);
    setPathParams(Object.fromEntries(names.map((p) => [p, ""])));
    setQueryRows([["", ""]]);
    setResponse(null);
    if (BODY_METHODS.has(endpoint.method) && endpoint.schema?.properties) {
      const example: Record<string, unknown> = {};
      for (const [k, prop] of Object.entries(endpoint.schema.properties)) {
        example[k] =
          prop.type === "number" || prop.type === "integer"
            ? 0
            : prop.type === "boolean"
              ? false
              : "";
      }
      setBodyText(JSON.stringify(example, null, 2));
    } else {
      setBodyText("{}");
    }
  }, [endpoint]);

  const buildUrl = (): string => {
    let url = endpoint.path;
    for (const [k, v] of Object.entries(pathParams)) {
      url = url.replace(`:${k}`, encodeURIComponent(v));
    }
    const qs = queryRows
      .filter(([k]) => k)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    return qs ? `${url}?${qs}` : url;
  };

  const send = async () => {
    setLoading(true);
    try {
      const hasBody = BODY_METHODS.has(endpoint.method);
      let body: unknown;
      if (hasBody) {
        try {
          body = JSON.parse(bodyText);
        } catch {
          body = bodyText;
        }
      }
      const res = await api.send(
        endpoint.method,
        buildUrl(),
        hasBody ? body : undefined
      );
      const text = await res.text();
      setResponse({ status: res.status, body: text });
    } catch (err) {
      setResponse({ status: 0, body: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* URL bar */}
      <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
        <span
          className={`font-mono text-xs font-semibold shrink-0 ${METHOD_ACCENT[endpoint.method] ?? "text-zinc-500"}`}
        >
          {endpoint.method}
        </span>
        <code className="flex-1 text-xs text-zinc-600 dark:text-zinc-400 font-mono truncate">
          {buildUrl()}
        </code>
        <button
          type="button"
          onClick={send}
          disabled={loading}
          className="shrink-0 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>

      {/* Path params */}
      {pathParamNames.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Path Parameters
          </p>
          <div className="space-y-1.5">
            {pathParamNames.map((k) => (
              <div key={k} className="flex items-center gap-2">
                <code className="text-xs text-zinc-500 dark:text-zinc-400 font-mono w-24 shrink-0">
                  :{k}
                </code>
                <input
                  className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors"
                  value={pathParams[k] ?? ""}
                  onChange={(ev) =>
                    setPathParams((p) => ({ ...p, [k]: ev.target.value }))
                  }
                  placeholder={k}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query params */}
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Query Parameters
        </p>
        <div className="space-y-1.5">
          {queryRows.map(([k, v], i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors"
                placeholder="key"
                value={k}
                onChange={(ev) =>
                  setQueryRows((rows) =>
                    rows.map((r, j) => (j === i ? [ev.target.value, r[1]] : r))
                  )
                }
              />
              <input
                className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors"
                placeholder="value"
                value={v}
                onChange={(ev) =>
                  setQueryRows((rows) =>
                    rows.map((r, j) => (j === i ? [r[0], ev.target.value] : r))
                  )
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            onClick={() => setQueryRows((rows) => [...rows, ["", ""]])}
          >
            + Add parameter
          </button>
        </div>
      </div>

      {/* Body */}
      {BODY_METHODS.has(endpoint.method) && (
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Request Body (JSON)
          </p>
          <textarea
            className="w-full h-36 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-xs font-mono text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div
            className={`flex items-center gap-2 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs`}
          >
            <span
              className={`font-semibold font-mono ${statusColor(response.status)}`}
            >
              {response.status || "Error"}
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">Response</span>
          </div>
          <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 px-3 py-3 overflow-auto max-h-56 whitespace-pre-wrap">
            {fmtJson(response.body)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Endpoint detail panel ────────────────────────────────────────────────────

function EndpointDetail({ endpoint }: { endpoint: EndpointInfo }) {
  const [activeTab, setActiveTab] = useState<"schema" | "try">("schema");
  const pathParams = extractPathParams(endpoint.path);
  const hasSchema =
    endpoint.schema?.properties &&
    Object.keys(endpoint.schema.properties).length > 0;
  const successStatus =
    endpoint.method === "POST"
      ? "201"
      : endpoint.method === "DELETE"
        ? "204"
        : "200";

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Endpoint header */}
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
        {endpoint.title && (
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
            {endpoint.title}
          </h2>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-md font-mono border ${METHOD_COLORS[endpoint.method] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"}`}
          >
            {endpoint.method}
          </span>
          <code className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
            {endpoint.path}
          </code>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
              endpoint.type === "secure"
                ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {endpoint.type === "secure" ? "🔒 secure" : "open"}
          </span>
        </div>
        {endpoint.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {endpoint.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 pt-0 border-b border-zinc-200 dark:border-zinc-800 flex gap-0">
        {(["schema", "try"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t
                ? "border-cyan-500 text-cyan-700 dark:text-cyan-400"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t === "schema" ? "Documentation" : "Try it"}
          </button>
        ))}
      </div>

      {activeTab === "schema" ? (
        <div className="px-6 py-5 space-y-6">
          {/* Path parameters */}
          {pathParams.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Path Parameters
              </h3>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-2">Required</div>
                  <div className="col-span-3">Notes</div>
                </div>
                {pathParams.map((p) => (
                  <SchemaField
                    key={p}
                    name={p}
                    prop={{ type: "string" }}
                    required={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Request body */}
          {hasSchema && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Request Body
              </h3>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <div className="col-span-4">Field</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-2">Required</div>
                  <div className="col-span-3">Constraints</div>
                </div>
                {Object.entries(endpoint.schema!.properties!).map(
                  ([name, prop]) => (
                    <SchemaField
                      key={name}
                      name={name}
                      prop={prop}
                      required={
                        endpoint.schema?.required?.includes(name) ?? false
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* Responses */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
              Responses
            </h3>
            <div className="space-y-2">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30">
                  <span className="font-mono font-semibold text-sm w-10 shrink-0 text-emerald-600 dark:text-emerald-400">
                    {successStatus}
                  </span>
                  <span className="text-sm text-emerald-700 dark:text-emerald-300 flex-1">
                    {successStatus === "204" ? "No content" : "Success"}
                  </span>
                </div>
                {endpoint.responseExample !== undefined &&
                  successStatus !== "204" && (
                    <div className="border-t border-emerald-100 dark:border-emerald-900">
                      <div className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                          Example response
                        </span>
                        <span className="text-xs text-zinc-300 dark:text-zinc-600 font-mono">
                          application/json
                        </span>
                      </div>
                      <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 px-4 py-3 overflow-auto max-h-72 whitespace-pre-wrap border-t border-zinc-100 dark:border-zinc-800">
                        {JSON.stringify(endpoint.responseExample, null, 2)}
                      </pre>
                    </div>
                  )}
              </div>

              {endpoint.type === "secure" && (
                <ResponseRow
                  status="401"
                  description="Unauthorized — missing or invalid token"
                  color="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
                />
              )}
              {hasSchema && (
                <ResponseRow
                  status="422"
                  description="Validation error — check request body fields"
                  color="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-5">
          <TryPanel endpoint={endpoint} />
        </div>
      )}
    </div>
  );
}

function ResponseRow({
  status,
  description,
  color,
}: {
  status: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${color}`}
    >
      <span className="font-mono font-semibold text-sm w-10 shrink-0">
        {status}
      </span>
      <span className="text-sm">{description}</span>
    </div>
  );
}

// ─── Main Schema page ─────────────────────────────────────────────────────────

export default function Schema() {
  const [endpoints, setEndpoints] = useState<EndpointInfo[]>([]);
  const [selected, setSelected] = useState<EndpointInfo | null>(null);

  useEffect(() => {
    api.endpoints().then(setEndpoints).catch(console.error);
  }, []);

  return (
    <div className="flex h-full">
      {/* Endpoint list */}
      <div className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
        <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h1 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Schema & Try
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 py-2">
          {endpoints.length === 0 && (
            <p className="px-4 py-8 text-xs text-zinc-400 dark:text-zinc-600 text-center">
              No endpoints discovered in endpoints/
            </p>
          )}
          {endpoints.map((e) => (
            <button
              key={`${e.method}-${e.path}`}
              type="button"
              onClick={() => setSelected(e)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                selected?.path === e.path && selected.method === e.method
                  ? "bg-cyan-50 dark:bg-cyan-950/30 border-r-2 border-cyan-500"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800 border-r-2 border-transparent"
              }`}
            >
              <span
                className={`w-14 text-center text-xs font-semibold px-1.5 py-0.5 rounded font-mono shrink-0 ${METHOD_COLORS[e.method] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"}`}
              >
                {e.method}
              </span>
              <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate">
                {e.path}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selected ? (
          <EndpointDetail
            key={`${selected.method}-${selected.path}`}
            endpoint={selected}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-300 dark:text-zinc-600 text-4xl mb-3">
                ◈
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Select an endpoint to view its schema
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
