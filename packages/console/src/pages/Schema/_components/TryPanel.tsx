import type React from "react";
import { useEffect, useState } from "react";
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
        extractPathParams(endpoint.path).map((param) => [param, ""])
      )
    );
    setHeaderRows(buildDefaultRows(endpoint.headerSchema));
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
      ([key]) => key && !omittedFields.has(`query:${key}`)
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
        headerRows.filter(([key]) => key && !omittedFields.has(`header:${key}`))
      );
      headers = { ...headers, ...customHeaders };

      if (hasBody) {
        if (bodyType === "json") {
          try {
            const parsed = JSON.parse(bodyText);
            const filtered = Object.fromEntries(
              Object.entries(parsed).filter(
                ([key]) => !omittedFields.has(`body:${key}`)
              )
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
    <div className="flex flex-col h-full bg-white dark:bg-[#0d1117] text-zinc-600 dark:text-zinc-300 font-mono text-[13px]">
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {/* Authentication Section */}
        <ConsoleSection title="Authentication">
          <AuthSection auth={auth} onChange={onAuthChange} />
        </ConsoleSection>

        {/* Path Parameters */}
        {pathParamNames.length > 0 && (
          <ConsoleSection title="Path Parameters">
            <div className="space-y-4">
              {pathParamNames.map((key) => (
                <div key={key} className="flex items-center gap-4 group">
                  <span className="w-24 text-zinc-400 dark:text-zinc-500 shrink-0">
                    :{key}
                  </span>
                  <input
                    className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 outline-none py-1.5 transition-colors text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
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
            </div>
          </ConsoleSection>
        )}

        {/* Headers Section */}
        <ConsoleSection
          title="Headers"
          action={
            <AddButton
              onClick={() => setHeaderRows((prev) => [...prev, ["", ""]])}
            />
          }
        >
          <EditableRowList
            rows={headerRows}
            onRowsChange={setHeaderRows}
            type="header"
            omittedFields={omittedFields}
            onToggleOmit={toggleOmit}
          />
        </ConsoleSection>

        {/* Query Parameters */}
        <ConsoleSection
          title="Query Parameters"
          action={
            <AddButton
              onClick={() => setQueryRows((prev) => [...prev, ["", ""]])}
            />
          }
        >
          <EditableRowList
            rows={queryRows}
            onRowsChange={setQueryRows}
            type="query"
            omittedFields={omittedFields}
            onToggleOmit={toggleOmit}
          />
        </ConsoleSection>

        {/* Body Section */}
        {BODY_METHODS.has(endpoint.method) && (
          <ConsoleSection
            title="Body"
            action={
              <div className="flex items-center gap-4">
                {bodyType === "form" && (
                  <AddButton
                    onClick={() => setFormRows((prev) => [...prev, ["", ""]])}
                  />
                )}
                <div className="flex p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setBodyType("json")}
                    className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${
                      bodyType === "json"
                        ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyType("form")}
                    className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${
                      bodyType === "form"
                        ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    }`}
                  >
                    FORM
                  </button>
                </div>
              </div>
            }
          >
            {bodyType === "json" ? (
              <textarea
                className="w-full h-56 bg-zinc-50 dark:bg-[#161b22] rounded-xl p-4 outline-none border border-zinc-200 dark:border-zinc-800 focus:border-cyan-500/30 dark:focus:border-cyan-500/20 resize-none leading-relaxed text-zinc-900 dark:text-zinc-100 transition-all"
                value={bodyText}
                onChange={(event) => setBodyText(event.target.value)}
                spellCheck={false}
              />
            ) : (
              <EditableRowList
                rows={formRows}
                onRowsChange={setFormRows}
                type="body"
                omittedFields={omittedFields}
                onToggleOmit={toggleOmit}
              />
            )}
          </ConsoleSection>
        )}

        {/* Response Area */}
        {response && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <ConsoleLabel>Response</ConsoleLabel>
              <div className="flex items-center gap-3 text-[11px] font-black">
                <span
                  className={`px-2 py-0.5 rounded-full ${statusColor(response.status)} bg-current/10`}
                >
                  {response.status}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500">
                  {response.elapsed}ms
                </span>
                <button
                  type="button"
                  onClick={() => setResponse(null)}
                  className="text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors uppercase tracking-tighter"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="relative group">
              <pre className="w-full bg-zinc-50 dark:bg-[#161b22] rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-[12px] leading-relaxed text-zinc-800 dark:text-zinc-200 shadow-sm max-h-[500px] scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                {fmtJson(response.body)}
              </pre>
              <button
                type="button"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-1 rounded shadow-sm border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest"
                onClick={() => navigator.clipboard.writeText(response.body)}
              >
                Copy
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Footer / Send Button */}
      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl sticky bottom-0 z-10">
        <button
          type="button"
          onClick={send}
          disabled={loading}
          className="group w-full h-12 bg-zinc-900 dark:bg-cyan-600 hover:bg-black dark:hover:bg-cyan-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 text-white font-black rounded-xl transition-all active:scale-[0.98] shadow-xl shadow-zinc-900/10 dark:shadow-cyan-500/20 flex items-center justify-center gap-3"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : (
            <>
              <span className="tracking-[0.2em] uppercase text-[11px]">
                Send Request
              </span>
              <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] border border-white/20 px-1.5 py-0.5 rounded">
                  ⌘
                </span>
                <span className="text-[10px] border border-white/20 px-1.5 py-0.5 rounded">
                  ↵
                </span>
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ConsoleSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <ConsoleLabel>{title}</ConsoleLabel>
        {action}
      </div>
      <div className="pl-1">{children}</div>
    </section>
  );
}

function EditableRowList({
  rows,
  onRowsChange,
  type,
  omittedFields,
  onToggleOmit,
}: {
  rows: [string, string][];
  onRowsChange: (rows: [string, string][]) => void;
  type: string;
  omittedFields: Set<string>;
  onToggleOmit: (key: string) => void;
}) {
  const updateRow = (index: number, key: string, value: string) => {
    onRowsChange(rows.map((row, i) => (i === index ? [key, value] : row)));
  };

  const removeRow = (index: number) => {
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <p className="text-[11px] text-zinc-400 italic pl-1">No entries</p>
      )}
      {rows.map(([key, value], index) => {
        const rowId = `${type}-${index}-${key}`;
        const isOmitted = omittedFields.has(`${type}:${key}`);
        return (
          <div
            key={rowId}
            className={`flex items-center gap-4 group transition-opacity ${isOmitted ? "opacity-40" : "opacity-100"}`}
          >
            <input
              className="w-32 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 outline-none py-1.5 transition-colors text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              placeholder="key"
              value={key}
              onChange={(event) => updateRow(index, event.target.value, value)}
            />
            <span className="text-zinc-300 dark:text-zinc-700 font-bold">
              :
            </span>
            <input
              className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 outline-none py-1.5 transition-colors text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              placeholder="value"
              value={value}
              onChange={(event) => updateRow(index, key, event.target.value)}
            />
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onToggleOmit(`${type}:${key}`)}
                className={`p-1.5 rounded-lg transition-colors ${isOmitted ? "text-red-500 bg-red-50 dark:bg-red-500/10" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}
                title={isOmitted ? "Include in request" : "Omit from request"}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label={isOmitted ? "Include" : "Omit"}
                >
                  <title>{isOmitted ? "Include" : "Omit"}</title>
                  {isOmitted ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  )}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Remove row"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="Remove"
                >
                  <title>Remove</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-[10px] font-black text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-all uppercase tracking-[0.1em] hover:translate-x-0.5 active:scale-95"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        role="img"
        aria-label="Add"
      >
        <title>Add</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add
    </button>
  );
}

function ConsoleLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <h3 className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] whitespace-nowrap">
        {children}
      </h3>
      <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1" />
    </div>
  );
}
