import { useEffect, useState } from "react";
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

import { CurlSample } from "./CurlSample.js";

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
    <div className="space-y-6">
      {/* Body Section Card */}
      <div className="bg-white dark:bg-[#161b22] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#161b22] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Try API Request
            </span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setBodyType("json")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                bodyType === "json"
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => setBodyType("form")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                bodyType === "form"
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              Form
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Auth */}
          <AuthSection auth={auth} onChange={onAuthChange} />

          {/* Form Fields */}
          <div className="space-y-3">
            {bodyType === "json" ? (
              <Textarea
                className="w-full h-40 resize-none leading-relaxed text-[13px] font-mono bg-zinc-50/30 dark:bg-[#0d1117] border-zinc-200 dark:border-zinc-800"
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
                spellCheck={false}
              />
            ) : (
              <div className="space-y-2">
                {formRows.map(([key, value], index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400 w-24 shrink-0 truncate">
                        {key || "field"}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">
                        :
                      </span>
                      <Input
                        className="flex-1 h-8 text-[12px] bg-transparent border-transparent focus:border-cyan-500/50 focus:ring-0 p-0"
                        placeholder="string, null"
                        value={value}
                        onChange={(event) =>
                          setFormRows((rows) =>
                            rows.map((row, rowIndex) =>
                              rowIndex === index
                                ? [row[0], event.target.value]
                                : row,
                            ),
                          )
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer group w-fit ml-28">
                      <input
                        type="checkbox"
                        checked={omittedFields.has(`body:${key}`)}
                        onChange={() => toggleOmit(`body:${key}`)}
                        className="w-3 h-3 rounded border-zinc-300 dark:border-zinc-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-transparent"
                      />
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        Omit {key || "field"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={send}
            disabled={loading}
            className="w-full h-9 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
          >
            {loading ? "Sending..." : "Send API Request"}
          </Button>
        </div>
      </div>

      {/* Code Sample Card */}
      <CurlSample
        endpoint={endpoint}
        auth={auth}
        pathParams={pathParams}
        queryRows={queryRows}
        bodyType={bodyType}
        bodyText={bodyText}
        formRows={formRows}
        omittedFields={omittedFields}
      />

      {/* Response Card */}
      {response && (
        <div className="bg-white dark:bg-[#161b22] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#161b22] flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Response Example
            </span>
            <button
              type="button"
              onClick={() => setResponse(null)}
              className="text-[10px] text-zinc-400 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="p-4 bg-[#f6f8fa] dark:bg-[#0d1117]">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`font-mono text-xs font-bold ${statusColor(
                  response.status,
                )}`}
              >
                {response.status || "Error"}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                {response.elapsed}ms
              </span>
            </div>
            <pre className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
              {fmtJson(response.body)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
