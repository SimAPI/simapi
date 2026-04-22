import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button.js";
import { Input, Textarea } from "../../../components/ui/Input.js";
import { SectionLabel } from "../../../components/ui/SectionLabel.js";
import { api } from "../../../lib/api.js";
import type { EndpointInfo } from "../../../types.js";
import { BODY_METHODS, METHOD_ACCENT } from "../_constants.js";
import type { AuthState } from "../_types.js";
import {
  buildAuthHeaders,
  buildAuthQuery,
  buildDefaultBody,
  buildDefaultRows,
  extractPathParams,
  fmtJson,
  statusColor,
} from "../_utils.js";
import { AuthSection } from "./AuthSection.js";

export function TryPanel({
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
    Object.fromEntries(pathParamNames.map((param) => [param, ""]))
  );
  const [headerRows, setHeaderRows] = useState<[string, string][]>(() => {
    const saved = localStorage.getItem("simapi-console-headers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return buildDefaultRows(endpoint.headerSchema);
  });
  const [queryRows, setQueryRows] = useState<[string, string][]>(() =>
    buildDefaultRows(endpoint.querySchema)
  );
  const [bodyType, setBodyType] = useState<"json" | "form">(() =>
    endpoint.formSchema && !endpoint.schema ? "form" : "json"
  );
  const [bodyText, setBodyText] = useState(() =>
    buildDefaultBody(endpoint, "json")
  );
  const [formRows, setFormRows] = useState<[string, string][]>(() =>
    buildDefaultRows(endpoint.formSchema)
  );
  const [response, setResponse] = useState<{
    status: number;
    body: string;
    elapsed: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("simapi-console-headers", JSON.stringify(headerRows));
  }, [headerRows]);

  useEffect(() => {
    setPathParams(
      Object.fromEntries(
        extractPathParams(endpoint.path).map((param) => [param, ""])
      )
    );
    setQueryRows(buildDefaultRows(endpoint.querySchema));
    setBodyType(endpoint.formSchema && !endpoint.schema ? "form" : "json");
    setBodyText(buildDefaultBody(endpoint, "json"));
    setFormRows(buildDefaultRows(endpoint.formSchema));
    setResponse(null);
  }, [endpoint]);

  const buildUrl = () => {
    let url = endpoint.path;
    for (const [key, value] of Object.entries(pathParams)) {
      url = url.replace(`:${key}`, encodeURIComponent(value || `:${key}`));
    }
    const queryParams = [...queryRows, ...buildAuthQuery(auth)].filter(
      ([key]) => key
    );
    if (queryParams.length > 0) {
      const searchParams = new URLSearchParams(queryParams);
      url += `?${searchParams.toString()}`;
    }
    return url;
  };

  const send = async () => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const hasBody = BODY_METHODS.has(endpoint.method);
      let body: unknown;
      let headers: Record<string, string> = buildAuthHeaders(auth);
      const customHeaders = Object.fromEntries(
        headerRows.filter(([key]) => key)
      );
      headers = { ...headers, ...customHeaders };

      if (hasBody) {
        if (bodyType === "json") {
          try {
            body = JSON.parse(bodyText);
          } catch {
            body = bodyText;
          }
          headers["content-type"] = "application/json";
        } else {
          const formData = new FormData();
          for (const [key, value] of formRows) {
            if (key) formData.append(key, value);
          }
          body = formData;
        }
      }

      const apiResponse = await api.send(
        endpoint.method,
        buildUrl(),
        hasBody ? body : undefined,
        Object.keys(headers).length > 0 ? headers : undefined
      );
      const text = await apiResponse.text();
      setResponse({
        status: apiResponse.status,
        body: text,
        elapsed: Date.now() - startTime,
      });
    } catch (error) {
      setResponse({
        status: 0,
        body: String(error),
        elapsed: Date.now() - startTime,
      });
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
        <Button onClick={send} disabled={loading} size="sm">
          {loading ? "Sending…" : "Send"}
        </Button>
      </div>

      {/* Authentication */}
      <div>
        <SectionLabel>Authentication</SectionLabel>
        <AuthSection auth={auth} onChange={onAuthChange} />
      </div>

      {/* Headers */}
      <div>
        <SectionLabel>Headers</SectionLabel>
        <div className="space-y-1.5">
          {headerRows.map(([key, value], index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional row
            <div key={index} className="flex gap-1.5">
              <Input
                className="w-36 shrink-0"
                placeholder="Header-Name"
                value={key}
                onChange={(event) =>
                  setHeaderRows((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index ? [event.target.value, row[1]] : row
                    )
                  )
                }
              />
              <Input
                className="flex-1"
                placeholder="value"
                value={value}
                onChange={(event) =>
                  setHeaderRows((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index ? [row[0], event.target.value] : row
                    )
                  )
                }
              />
              {headerRows.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setHeaderRows((rows) =>
                      rows.filter((_, rowIndex) => rowIndex !== index)
                    )
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

      {/* Path Params */}
      {pathParamNames.length > 0 && (
        <div>
          <SectionLabel>Path Parameters</SectionLabel>
          <div className="space-y-1.5">
            {pathParamNames.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <code className="text-xs text-zinc-400 dark:text-zinc-500 font-mono w-24 shrink-0">
                  :{key}
                </code>
                <Input
                  className="flex-1"
                  value={pathParams[key] ?? ""}
                  onChange={(event) =>
                    setPathParams((previousParams) => ({
                      ...previousParams,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder={key}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Params */}
      <div>
        <SectionLabel>Query Parameters</SectionLabel>
        <div className="space-y-1.5">
          {queryRows.map(([key, value], index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional row
            <div key={index} className="flex gap-1.5">
              <Input
                className="flex-1"
                placeholder="key"
                value={key}
                onChange={(event) =>
                  setQueryRows((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index ? [event.target.value, row[1]] : row
                    )
                  )
                }
              />
              <Input
                className="flex-1"
                placeholder="value"
                value={value}
                onChange={(event) =>
                  setQueryRows((rows) =>
                    rows.map((row, rowIndex) =>
                      rowIndex === index ? [row[0], event.target.value] : row
                    )
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
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Request Body</SectionLabel>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBodyType("json")}
                className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${
                  bodyType === "json"
                    ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setBodyType("form")}
                className={`text-[10px] font-medium px-2 py-0.5 rounded transition-colors ${
                  bodyType === "form"
                    ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                Form
              </button>
            </div>
          </div>

          {bodyType === "json" ? (
            <Textarea
              className="w-full h-40 resize-none leading-relaxed"
              value={bodyText}
              onChange={(event) => setBodyText(event.target.value)}
              spellCheck={false}
            />
          ) : (
            <div className="space-y-1.5">
              {formRows.map(([key, value], index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: positional row
                <div key={index} className="flex gap-1.5">
                  <Input
                    className="flex-1"
                    placeholder="key"
                    value={key}
                    onChange={(event) =>
                      setFormRows((rows) =>
                        rows.map((row, rowIndex) =>
                          rowIndex === index
                            ? [event.target.value, row[1]]
                            : row
                        )
                      )
                    }
                  />
                  <Input
                    className="flex-1"
                    placeholder="value"
                    value={value}
                    onChange={(event) =>
                      setFormRows((rows) =>
                        rows.map((row, rowIndex) =>
                          rowIndex === index
                            ? [row[0], event.target.value]
                            : row
                        )
                      )
                    }
                  />
                  {formRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormRows((rows) =>
                          rows.filter((_, rowIndex) => rowIndex !== index)
                        )
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
                onClick={() => setFormRows((rows) => [...rows, ["", ""]])}
              >
                + Add field
              </button>
            </div>
          )}
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-xs font-bold ${statusColor(response.status)}`}
            >
              {response.status || "Error"}
              <span className="ml-2 font-normal text-[10px] text-zinc-400 dark:text-zinc-500">
                {response.elapsed}ms
              </span>
            </span>
            <button
              type="button"
              className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              onClick={() => setResponse(null)}
            >
              Clear
            </button>
          </div>
          <pre className="p-3 rounded-md bg-zinc-900 text-zinc-300 text-[11px] font-mono overflow-x-auto border border-zinc-800 max-h-80">
            {fmtJson(response.body)}
          </pre>
        </div>
      )}
    </div>
  );
}
