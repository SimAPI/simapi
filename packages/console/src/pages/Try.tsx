import { useEffect, useState } from "react";

import { api } from "../lib/api.js";
import type { EndpointInfo } from "../types.js";

const METHOD_COLOR: Record<string, string> = {
  GET: "bg-blue-950 text-blue-300",
  POST: "bg-green-950 text-green-300",
  PUT: "bg-yellow-950 text-yellow-300",
  PATCH: "bg-orange-950 text-orange-300",
  DELETE: "bg-red-950 text-red-300",
};

const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

function fmtJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

function extractPathParams(path: string): string[] {
  return (path.match(/:(\w+)/g) ?? []).map((m) => m.slice(1));
}

export default function Try() {
  const [endpoints, setEndpoints] = useState<EndpointInfo[]>([]);
  const [selected, setSelected] = useState<EndpointInfo | null>(null);
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryRows, setQueryRows] = useState<[string, string][]>([["", ""]]);
  const [bodyText, setBodyText] = useState("{}");
  const [response, setResponse] = useState<{
    status: number;
    body: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.endpoints().then(setEndpoints).catch(console.error);
  }, []);

  const select = (e: EndpointInfo) => {
    setSelected(e);
    const params = extractPathParams(e.path);
    setPathParams(Object.fromEntries(params.map((p) => [p, ""])));
    setQueryRows([["", ""]]);
    setBodyText("{}");
    setResponse(null);
  };

  const buildUrl = (e: EndpointInfo): string => {
    let url = e.path;
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
    if (!selected) return;
    setLoading(true);
    try {
      const hasBody = BODY_METHODS.has(selected.method);
      let parsedBody: unknown;
      if (hasBody) {
        try {
          parsedBody = JSON.parse(bodyText);
        } catch {
          parsedBody = bodyText;
        }
      }
      const res = await api.send(
        selected.method,
        buildUrl(selected),
        hasBody ? parsedBody : undefined
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
    <div className="grid grid-cols-5 gap-6">
      {/* Endpoint list */}
      <div className="col-span-2 space-y-1.5">
        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">
          Endpoints
        </p>
        {endpoints.map((e) => (
          <button
            type="button"
            key={`${e.method}-${e.path}`}
            onClick={() => select(e)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left border transition-colors ${
              selected?.path === e.path && selected.method === e.method
                ? "border-zinc-600 bg-zinc-800"
                : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
            }`}
          >
            <span
              className={`w-14 text-center text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${METHOD_COLOR[e.method] ?? "bg-zinc-800 text-zinc-300"}`}
            >
              {e.method}
            </span>
            <span className="text-zinc-300 font-mono text-xs truncate">
              {e.path}
            </span>
          </button>
        ))}
        {endpoints.length === 0 && (
          <p className="text-zinc-600 text-xs">No endpoints</p>
        )}
      </div>

      {/* Request / response panel */}
      <div className="col-span-3 space-y-3">
        {selected ? (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
              {/* Path params */}
              {extractPathParams(selected.path).length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Path params</p>
                  {extractPathParams(selected.path).map((k) => (
                    <div key={k} className="flex items-center gap-2 mb-1.5">
                      <span className="text-zinc-500 text-xs w-20 shrink-0 font-mono">
                        :{k}
                      </span>
                      <input
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                        value={pathParams[k] ?? ""}
                        onChange={(ev) =>
                          setPathParams((p) => ({ ...p, [k]: ev.target.value }))
                        }
                        placeholder={k}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Query params */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Query params</p>
                {queryRows.map(([k, v], i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: query rows are positional
                  <div key={i} className="flex gap-2 mb-1.5">
                    <input
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                      placeholder="key"
                      value={k}
                      onChange={(ev) =>
                        setQueryRows((rows) =>
                          rows.map((r, j) =>
                            j === i ? [ev.target.value, r[1]] : r
                          )
                        )
                      }
                    />
                    <input
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                      placeholder="value"
                      value={v}
                      onChange={(ev) =>
                        setQueryRows((rows) =>
                          rows.map((r, j) =>
                            j === i ? [r[0], ev.target.value] : r
                          )
                        )
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  onClick={() => setQueryRows((rows) => [...rows, ["", ""]])}
                >
                  + add param
                </button>
              </div>

              {/* Body */}
              {BODY_METHODS.has(selected.method) && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Body (JSON)</p>
                  <textarea
                    className="w-full h-28 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-200 font-mono resize-none focus:outline-none focus:border-zinc-500"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    spellCheck={false}
                  />
                </div>
              )}

              {/* URL preview + send */}
              <div className="flex items-center gap-3">
                <code className="flex-1 text-xs text-zinc-400 bg-zinc-800 rounded px-2 py-1.5 truncate">
                  {selected.method} {buildUrl(selected)}
                </code>
                <button
                  type="button"
                  onClick={send}
                  disabled={loading}
                  className="px-4 py-1.5 bg-zinc-100 text-zinc-900 rounded text-xs font-semibold hover:bg-white disabled:opacity-50 transition-colors shrink-0"
                >
                  {loading ? "Sending…" : "Send"}
                </button>
              </div>
            </div>

            {/* Response */}
            {response && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-sm font-medium ${response.status >= 400 ? "text-red-400" : "text-green-400"}`}
                  >
                    {response.status || "Error"}
                  </span>
                  <span className="text-xs text-zinc-600">Response</span>
                </div>
                <pre className="text-xs text-zinc-300 overflow-auto max-h-64 bg-zinc-950 rounded p-3">
                  {fmtJson(response.body)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <p className="text-zinc-600 text-xs">
            Select an endpoint from the list to try it
          </p>
        )}
      </div>
    </div>
  );
}
