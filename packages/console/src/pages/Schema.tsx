import { useEffect, useState } from "react";

import { api } from "../lib/api.js";
import type { EndpointInfo, JsonSchemaProperty } from "../types.js";

// ─── auth types ───────────────────────────────────────────────────────────────

type AuthPreset =
  | "none"
  | "bearer"
  | "basic"
  | "apiKey-header"
  | "apiKey-query"
  | "cookie";

interface AuthState {
  preset: AuthPreset;
  token: string;
  username: string;
  password: string;
  keyName: string;
  keyValue: string;
}

const DEFAULT_AUTH: AuthState = {
  preset: "none",
  token: "",
  username: "",
  password: "",
  keyName: "x-api-key",
  keyValue: "",
};

const AUTH_OPTIONS: { value: AuthPreset; label: string }[] = [
  { value: "none", label: "No Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
  { value: "apiKey-header", label: "API Key — Header" },
  { value: "apiKey-query", label: "API Key — Query Param" },
  { value: "cookie", label: "Cookie / Session" },
];

// ─── constants ────────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900",
  POST: "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900",
  PUT: "bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-100 dark:border-yellow-900",
  PATCH:
    "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900",
  DELETE:
    "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900",
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
  if (s >= 400) return "text-yellow-500 dark:text-yellow-400";
  return "text-emerald-500 dark:text-emerald-400";
}

function buildDefaultBody(ep: EndpointInfo): string {
  if (!BODY_METHODS.has(ep.method) || !ep.schema?.properties) return "{}";
  const example: Record<string, unknown> = {};
  for (const [k, prop] of Object.entries(ep.schema.properties)) {
    example[k] =
      prop.type === "number" || prop.type === "integer"
        ? 0
        : prop.type === "boolean"
          ? false
          : "";
  }
  return JSON.stringify(example, null, 2);
}

function buildAuthHeaders(auth: AuthState): Record<string, string> {
  switch (auth.preset) {
    case "bearer":
      return auth.token ? { authorization: `Bearer ${auth.token}` } : {};
    case "basic": {
      if (!auth.username) return {};
      return {
        authorization: `Basic ${btoa(`${auth.username}:${auth.password}`)}`,
      };
    }
    case "apiKey-header":
      return auth.keyName && auth.keyValue
        ? { [auth.keyName]: auth.keyValue }
        : {};
    case "cookie":
      return auth.keyName && auth.keyValue
        ? { cookie: `${auth.keyName}=${auth.keyValue}` }
        : {};
    default:
      return {};
  }
}

function buildAuthQuery(auth: AuthState): [string, string][] {
  if (auth.preset === "apiKey-query" && auth.keyName && auth.keyValue) {
    return [[auth.keyName, auth.keyValue]];
  }
  return [];
}

// ─── shared input class ───────────────────────────────────────────────────────

const inputCls =
  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors";

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
    <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-zinc-50 dark:border-zinc-800/60 last:border-0 items-baseline">
      <div className="col-span-4 font-mono text-xs text-zinc-800 dark:text-zinc-200">
        {name}
        {required && <span className="text-red-400 ml-0.5 text-[10px]">*</span>}
      </div>
      <div className="col-span-3 font-mono text-xs text-cyan-600 dark:text-cyan-400">
        {typeLabel(prop)}
      </div>
      <div className="col-span-2">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            required
              ? "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {required ? "required" : "optional"}
        </span>
      </div>
      <div className="col-span-3 text-[10px] text-zinc-400 dark:text-zinc-500">
        {constraints.join(", ")}
      </div>
    </div>
  );
}

// ─── Response row ─────────────────────────────────────────────────────────────

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
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${color}`}
    >
      <span className="font-mono font-semibold text-xs w-8 shrink-0">
        {status}
      </span>
      <span className="text-xs">{description}</span>
    </div>
  );
}

// ─── Auth section (shared between Schema page and TryPanel) ───────────────────

function AuthSection({
  auth,
  onChange,
}: {
  auth: AuthState;
  onChange: (auth: AuthState) => void;
}) {
  const set = (patch: Partial<AuthState>) => onChange({ ...auth, ...patch });

  return (
    <div className="space-y-2">
      <select
        value={auth.preset}
        onChange={(e) =>
          onChange({ ...DEFAULT_AUTH, preset: e.target.value as AuthPreset })
        }
        className={`w-full ${inputCls} appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")] bg-position-[right_0.5rem_center] bg-no-repeat pr-7`}
      >
        {AUTH_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {auth.preset === "bearer" && (
        <input
          className={`w-full ${inputCls}`}
          placeholder="Token"
          value={auth.token}
          onChange={(e) => set({ token: e.target.value })}
        />
      )}

      {auth.preset === "basic" && (
        <div className="flex gap-2">
          <input
            className={`flex-1 ${inputCls}`}
            placeholder="Username"
            value={auth.username}
            onChange={(e) => set({ username: e.target.value })}
          />
          <input
            className={`flex-1 ${inputCls}`}
            placeholder="Password"
            type="password"
            value={auth.password}
            onChange={(e) => set({ password: e.target.value })}
          />
        </div>
      )}

      {(auth.preset === "apiKey-header" ||
        auth.preset === "apiKey-query" ||
        auth.preset === "cookie") && (
        <div className="flex gap-2">
          <input
            className={`w-36 shrink-0 ${inputCls}`}
            placeholder={auth.preset === "cookie" ? "Cookie name" : "Key name"}
            value={auth.keyName}
            onChange={(e) => set({ keyName: e.target.value })}
          />
          <input
            className={`flex-1 ${inputCls}`}
            placeholder="Value"
            value={auth.keyValue}
            onChange={(e) => set({ keyValue: e.target.value })}
          />
        </div>
      )}

      {auth.preset !== "none" && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
          {auth.preset === "bearer" && "Sent as: Authorization: Bearer <token>"}
          {auth.preset === "basic" &&
            "Sent as: Authorization: Basic <base64(user:pass)>"}
          {auth.preset === "apiKey-header" &&
            `Sent as: ${auth.keyName || "<header>"}: <value>`}
          {auth.preset === "apiKey-query" &&
            `Appended to URL: ?${auth.keyName || "key"}=<value>`}
          {auth.preset === "cookie" &&
            `Sent as: Cookie: ${auth.keyName || "<name>"}=<value>`}
        </p>
      )}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
      {children}
    </p>
  );
}

// ─── Try-it panel ─────────────────────────────────────────────────────────────

function TryPanel({
  endpoint,
  auth,
  onAuthChange,
}: {
  endpoint: EndpointInfo;
  auth: AuthState;
  onAuthChange: (auth: AuthState) => void;
}) {
  const pathParamNames = extractPathParams(endpoint.path);

  const [pathParams, setPathParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(pathParamNames.map((p) => [p, ""]))
  );
  const [headerRows, setHeaderRows] = useState<[string, string][]>([["", ""]]);
  const [queryRows, setQueryRows] = useState<[string, string][]>([["", ""]]);
  const [bodyText, setBodyText] = useState(() => buildDefaultBody(endpoint));
  const [response, setResponse] = useState<{
    status: number;
    body: string;
    elapsed: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPathParams(
      Object.fromEntries(extractPathParams(endpoint.path).map((p) => [p, ""]))
    );
    setHeaderRows([["", ""]]);
    setQueryRows([["", ""]]);
    setBodyText(buildDefaultBody(endpoint));
    setResponse(null);
  }, [endpoint]);

  const buildUrl = (): string => {
    let url = endpoint.path;
    for (const [k, v] of Object.entries(pathParams)) {
      url = url.replace(`:${k}`, encodeURIComponent(v));
    }
    const allQuery = [...queryRows, ...buildAuthQuery(auth)];
    const qs = allQuery
      .filter(([k]) => k)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    return qs ? `${url}?${qs}` : url;
  };

  const send = async () => {
    setLoading(true);
    const t0 = Date.now();
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
      const authHeaders = buildAuthHeaders(auth);
      const customHeaders = Object.fromEntries(headerRows.filter(([k]) => k));
      const allHeaders = { ...authHeaders, ...customHeaders };
      const res = await api.send(
        endpoint.method,
        buildUrl(),
        hasBody ? body : undefined,
        Object.keys(allHeaders).length > 0 ? allHeaders : undefined
      );
      const text = await res.text();
      setResponse({
        status: res.status,
        body: text,
        elapsed: Date.now() - t0,
      });
    } catch (err) {
      setResponse({ status: 0, body: String(err), elapsed: Date.now() - t0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* URL bar */}
      <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
        <span
          className={`font-mono text-xs font-bold shrink-0 ${METHOD_ACCENT[endpoint.method] ?? "text-zinc-500"}`}
        >
          {endpoint.method}
        </span>
        <code className="flex-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
          {buildUrl()}
        </code>
        <button
          type="button"
          onClick={send}
          disabled={loading}
          className="shrink-0 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>

      {/* Authentication (persists across endpoints) */}
      <div>
        <SectionLabel>Authentication</SectionLabel>
        <AuthSection auth={auth} onChange={onAuthChange} />
      </div>

      {/* Custom headers */}
      <div>
        <SectionLabel>Headers</SectionLabel>
        <div className="space-y-1.5">
          {headerRows.map(([k, v], i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional row
            <div key={i} className="flex gap-1.5">
              <input
                className={`w-36 shrink-0 ${inputCls}`}
                placeholder="Header-Name"
                value={k}
                onChange={(ev) =>
                  setHeaderRows((rows) =>
                    rows.map((r, j) => (j === i ? [ev.target.value, r[1]] : r))
                  )
                }
              />
              <input
                className={`flex-1 ${inputCls}`}
                placeholder="value"
                value={v}
                onChange={(ev) =>
                  setHeaderRows((rows) =>
                    rows.map((r, j) => (j === i ? [r[0], ev.target.value] : r))
                  )
                }
              />
              {headerRows.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setHeaderRows((rows) => rows.filter((_, j) => j !== i))
                  }
                  className="shrink-0 w-7 h-7 rounded-md text-zinc-300 dark:text-zinc-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center text-base leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            onClick={() => setHeaderRows((rows) => [...rows, ["", ""]])}
          >
            + Add header
          </button>
        </div>
      </div>

      {/* Path params */}
      {pathParamNames.length > 0 && (
        <div>
          <SectionLabel>Path Parameters</SectionLabel>
          <div className="space-y-1.5">
            {pathParamNames.map((k) => (
              <div key={k} className="flex items-center gap-2">
                <code className="text-xs text-zinc-400 dark:text-zinc-500 font-mono w-24 shrink-0">
                  :{k}
                </code>
                <input
                  className={`flex-1 ${inputCls}`}
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
        <SectionLabel>Query Parameters</SectionLabel>
        <div className="space-y-1.5">
          {queryRows.map(([k, v], i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional row
            <div key={i} className="flex gap-1.5">
              <input
                className={`flex-1 ${inputCls}`}
                placeholder="key"
                value={k}
                onChange={(ev) =>
                  setQueryRows((rows) =>
                    rows.map((r, j) => (j === i ? [ev.target.value, r[1]] : r))
                  )
                }
              />
              <input
                className={`flex-1 ${inputCls}`}
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
          <SectionLabel>Request Body (JSON)</SectionLabel>
          <textarea
            className={`w-full h-40 ${inputCls} resize-none leading-relaxed`}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
            <span
              className={`font-semibold font-mono text-xs ${statusColor(response.status)}`}
            >
              {response.status || "Error"}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
              {response.elapsed}ms
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
              Response
            </span>
          </div>
          <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 px-3 py-3 overflow-auto max-h-56 whitespace-pre-wrap leading-relaxed">
            {fmtJson(response.body)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Endpoint detail panel ────────────────────────────────────────────────────

function EndpointDetail({
  endpoint,
  auth,
  onAuthChange,
}: {
  endpoint: EndpointInfo;
  auth: AuthState;
  onAuthChange: (auth: AuthState) => void;
}) {
  const [activeTab, setActiveTab] = useState<"docs" | "try">("docs");
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
    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        {endpoint.title && (
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
            {endpoint.title}
          </h2>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded border font-mono ${METHOD_COLORS[endpoint.method] ?? "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-100 dark:border-zinc-700"}`}
          >
            {endpoint.method}
          </span>
          <code className="text-sm font-mono text-zinc-700 dark:text-zinc-200">
            {endpoint.path}
          </code>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
              endpoint.type === "secure"
                ? "border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                : "border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {endpoint.type === "secure" ? "🔒 secure" : "open"}
          </span>
        </div>
        {endpoint.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            {endpoint.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 shrink-0 px-6">
        {(["docs", "try"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`px-1 py-3 mr-5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {t === "docs" ? "Documentation" : "Try it"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "docs" ? (
          <div className="px-6 py-5 space-y-6">
            {/* Path parameters */}
            {pathParams.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                  Path Parameters
                </h3>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/60">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
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
                <h3 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                  Request Body
                </h3>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/60">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                    <div className="col-span-4">Field</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-2">Required</div>
                    <div className="col-span-3">Constraints</div>
                  </div>
                  {Object.entries(endpoint.schema?.properties ?? {}).map(
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
              <h3 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Responses
              </h3>
              <div className="space-y-2">
                {/* Success */}
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20">
                    <span className="font-mono font-semibold text-xs w-8 shrink-0 text-emerald-600 dark:text-emerald-400">
                      {successStatus}
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300">
                      {successStatus === "204" ? "No content" : "Success"}
                    </span>
                  </div>
                  {endpoint.responseExample !== undefined &&
                    successStatus !== "204" && (
                      <div className="border-t border-emerald-100 dark:border-emerald-900/40">
                        <div className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wide">
                            Example response
                          </span>
                          <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-mono">
                            application/json
                          </span>
                        </div>
                        <pre className="text-xs font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 px-4 py-3 overflow-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                          {JSON.stringify(endpoint.responseExample, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>

                {endpoint.type === "secure" && (
                  <ResponseRow
                    status="401"
                    description="Unauthorized — missing or invalid credentials"
                    color="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/60"
                  />
                )}
                {hasSchema && (
                  <ResponseRow
                    status="422"
                    description="Validation error — check request body fields"
                    color="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/60"
                  />
                )}
                <ResponseRow
                  status="500"
                  description="Internal server error"
                  color="text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5">
            <TryPanel
              endpoint={endpoint}
              auth={auth}
              onAuthChange={onAuthChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Schema page ─────────────────────────────────────────────────────────

export default function Schema() {
  const [endpoints, setEndpoints] = useState<EndpointInfo[]>([]);
  const [selected, setSelected] = useState<EndpointInfo | null>(null);
  const [search, setSearch] = useState("");
  const [auth, setAuth] = useState<AuthState>({ ...DEFAULT_AUTH });

  useEffect(() => {
    api.endpoints().then(setEndpoints).catch(console.error);
  }, []);

  const filtered = search
    ? endpoints.filter(
        (e) =>
          e.path.toLowerCase().includes(search.toLowerCase()) ||
          e.method.toLowerCase().includes(search.toLowerCase()) ||
          (e.title ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : endpoints;

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Endpoint list */}
      <div className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
        {/* List header with search */}
        <div className="px-3 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 space-y-2">
          <div className="flex items-baseline justify-between px-1">
            <h1 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Schema & Try
            </h1>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
              {filtered.length}
            </span>
          </div>
          <input
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 dark:focus:border-cyan-600 transition-colors"
            placeholder="Search endpoints…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Endpoint list */}
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-xs text-zinc-400 dark:text-zinc-500 text-center">
              {search ? "No endpoints match." : "No endpoints discovered."}
            </p>
          )}
          {filtered.map((e) => {
            const isSelected =
              selected?.path === e.path && selected.method === e.method;
            return (
              <button
                key={`${e.method}-${e.path}`}
                type="button"
                onClick={() => setSelected(e)}
                className={`w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors border-r-2 ${
                  isSelected
                    ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-500"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-transparent"
                }`}
              >
                <span
                  className={`mt-0.5 w-12 text-center text-[10px] font-bold px-1 py-0.5 rounded border font-mono shrink-0 ${METHOD_COLORS[e.method] ?? "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-100 dark:border-zinc-700"}`}
                >
                  {e.method}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-mono text-zinc-700 dark:text-zinc-200 truncate">
                    {e.path}
                  </p>
                  {e.title && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                      {e.title}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {selected ? (
          <EndpointDetail
            key={`${selected.method}-${selected.path}`}
            endpoint={selected}
            auth={auth}
            onAuthChange={setAuth}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-xs px-6">
              <p className="text-zinc-200 dark:text-zinc-700 text-5xl mb-4">
                ◈
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">
                Select an endpoint
              </p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs">
                View its schema, request validation, and try it live.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
