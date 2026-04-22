import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button.js";
import { Input, Textarea } from "../../../components/ui/Input.js";
import { api } from "../../../lib/api.js";
import type { EndpointInfo } from "../../../types.js";
import { BODY_METHODS } from "../_constants.js";
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
    Object.fromEntries(pathParamNames.map((param) => [param, ""])),
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
    buildDefaultRows(endpoint.querySchema),
  );
  const [bodyType, setBodyType] = useState<"json" | "form">(() =>
    endpoint.formSchema && !endpoint.schema ? "form" : "json",
  );
  const [bodyText, setBodyText] = useState(() =>
    buildDefaultBody(endpoint, "json"),
  );
  const [formRows, setFormRows] = useState<[string, string][]>(() =>
    buildDefaultRows(endpoint.formSchema),
  );
  const [omittedFields, setOmittedFields] = useState<Set<string>>(new Set());

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
        extractPathParams(endpoint.path).map((param) => [param, ""]),
      ),
    );
    setQueryRows(buildDefaultRows(endpoint.querySchema));
    setBodyType(endpoint.formSchema && !endpoint.schema ? "form" : "json");
    setBodyText(buildDefaultBody(endpoint, "json"));
    setFormRows(buildDefaultRows(endpoint.formSchema));
    setOmittedFields(new Set());
    setResponse(null);
  }, [endpoint]);

  const toggleOmit = (key: string) => {
    setOmittedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const buildUrl = () => {
    let url = endpoint.path;
    for (const [key, value] of Object.entries(pathParams)) {
      url = url.replace(`:${key}`, encodeURIComponent(value || `:${key}`));
    }
    const queryParams = [...queryRows, ...buildAuthQuery(auth)].filter(
      ([key]) => key && !omittedFields.has(`query:${key}`),
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
        headerRows.filter(
          ([key]) => key && !omittedFields.has(`header:${key}`),
        ),
      );
      headers = { ...headers, ...customHeaders };

      if (hasBody) {
        if (bodyType === "json") {
          try {
            const parsed = JSON.parse(bodyText);
            const filtered = Object.fromEntries(
              Object.entries(parsed).filter(
                ([key]) => !omittedFields.has(`body:${key}`),
              ),
            );
            body = filtered;
          } catch {
            body = bodyText;
          }
          headers["content-type"] = "application/json";
        } else {
          const formData = new FormData();
          for (const [key, value] of formRows) {
            if (key && !omittedFields.has(`body:${key}`))
              formData.append(key, value);
          }
          body = formData;
        }
      }

      const apiResponse = await api.send(
        endpoint.method,
        buildUrl(),
        hasBody ? body : undefined,
        Object.keys(headers).length > 0 ? headers : undefined,
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
    <div className="flex flex-col h-full bg-[#0d1117] text-zinc-300 font-mono text-[13px]">
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Authentication Section */}
        <section className="space-y-4">
          <ConsoleLabel>Authentication</ConsoleLabel>
          <AuthSection auth={auth} onChange={onAuthChange} />
        </section>

        {/* Parameters Section */}
        {(pathParamNames.length > 0 || queryRows.length > 0) && (
          <section className="space-y-4">
            <ConsoleLabel>Parameters</ConsoleLabel>
            <div className="space-y-4">
              {pathParamNames.map((key) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="w-24 text-zinc-500 shrink-0">:{key}</span>
                  <input
                    className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors"
                    placeholder="value"
                    value={pathParams[key] ?? ""}
                    onChange={(event) =>
                      setPathParams((previous) => ({
                        ...previous,
                        [key]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
              {queryRows.map(([key, value], index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="w-24 text-zinc-500 shrink-0 truncate">
                    {key}
                  </span>
                  <input
                    className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors"
                    placeholder="value"
                    value={value}
                    onChange={(event) =>
                      setQueryRows((rows) =>
                        rows.map((row, i) =>
                          i === index ? [row[0], event.target.value] : row,
                        ),
                      )
                    }
                  />
                  <input
                    type="checkbox"
                    checked={omittedFields.has(`query:${key}`)}
                    onChange={() => toggleOmit(`query:${key}`)}
                    className="w-3 h-3 rounded border-zinc-700 bg-transparent text-cyan-600 focus:ring-0"
                    title="Omit from request"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Body Section */}
        {BODY_METHODS.has(endpoint.method) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <ConsoleLabel>Body</ConsoleLabel>
              <div className="flex gap-3 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setBodyType("json")}
                  className={
                    bodyType === "json" ? "text-cyan-400" : "text-zinc-600"
                  }
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => setBodyType("form")}
                  className={
                    bodyType === "form" ? "text-cyan-400" : "text-zinc-600"
                  }
                >
                  FORM
                </button>
              </div>
            </div>

            {bodyType === "json" ? (
              <textarea
                className="w-full h-48 bg-[#161b22] rounded-lg p-4 outline-none border border-zinc-800 focus:border-zinc-700 resize-none leading-relaxed"
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
                spellCheck={false}
              />
            ) : (
              <div className="space-y-4">
                {formRows.map(([key, value], index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="w-24 text-zinc-500 shrink-0 truncate font-bold">
                        {key}
                      </span>
                      <input
                        className="flex-1 bg-transparent border-b border-zinc-800 focus:border-cyan-500 outline-none py-1 transition-colors"
                        placeholder="value"
                        value={value}
                        onChange={(event) =>
                          setFormRows((rows) =>
                            rows.map((row, i) =>
                              i === index ? [row[0], event.target.value] : row,
                            ),
                          )
                        }
                      />
                      <input
                        type="checkbox"
                        checked={omittedFields.has(`body:${key}`)}
                        onChange={() => toggleOmit(`body:${key}`)}
                        className="w-3 h-3 rounded border-zinc-700 bg-transparent text-cyan-600 focus:ring-0"
                        title="Omit from request"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Response Area */}
        {response && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <ConsoleLabel>Response</ConsoleLabel>
              <div className="flex items-center gap-3 text-[11px]">
                <span className={statusColor(response.status)}>
                  {response.status}
                </span>
                <span className="text-zinc-600">{response.elapsed}ms</span>
                <button
                  type="button"
                  onClick={() => setResponse(null)}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  CLEAR
                </button>
              </div>
            </div>
            <pre className="w-full bg-[#161b22] rounded-lg p-4 border border-zinc-800 overflow-x-auto text-[12px] leading-relaxed">
              {fmtJson(response.body)}
            </pre>
          </section>
        )}
      </div>

      {/* Footer / Send Button */}
      <div className="p-6 border-t border-zinc-800 bg-[#0d1117]/80 backdrop-blur-sm sticky bottom-0">
        <button
          onClick={send}
          disabled={loading}
          className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 text-white font-bold rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">EXECUTING...</span>
          ) : (
            <>
              <span>SEND REQUEST</span>
              <span className="text-[10px] bg-cyan-700 px-1.5 py-0.5 rounded ml-2">
                ⌘ ↵
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ConsoleLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap">
        {children}
      </h3>
      <div className="h-px bg-zinc-800 flex-1" />
    </div>
  );
}
