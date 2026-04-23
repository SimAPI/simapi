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
} from "../_utils.js";
import { AuthSection } from "./AuthSection.js";
import { AddButton, ConsoleSection } from "./TryPanel/ConsoleElements.js";
import { EditableRowList } from "./TryPanel/EditableRowList.js";
import { ResponseTerminal } from "./TryPanel/ResponseTerminal.js";
import { TryActionFooter } from "./TryPanel/TryActionFooter.js";

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      send();
    }
  };

  return (
    <div
      className="flex flex-col bg-transparent text-muted-foreground font-mono text-[13px] relative focus:outline-none"
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="API Try Panel"
      tabIndex={-1}
    >
      {/* Dynamic Header Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50" />

      <div className="px-6 py-12 space-y-16">
        {/* Authentication Control */}
        <ConsoleSection title="Identity">
          <AuthSection auth={auth} onChange={onAuthChange} />
        </ConsoleSection>

        {/* Path Resolver */}
        {pathParamNames.length > 0 && (
          <ConsoleSection title="Dynamic Path">
            <div className="space-y-6">
              {pathParamNames.map((key) => (
                <div key={key} className="flex items-center gap-6 group">
                  <span className="w-24 text-[11px] font-black text-muted-foreground uppercase tracking-widest shrink-0">
                    :{key}
                  </span>
                  <input
                    className="flex-1 bg-transparent border-b border-border focus:border-primary/50 outline-none py-2 transition-all text-foreground placeholder:text-muted-foreground/30"
                    placeholder="resolve..."
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

        {/* Header Controller */}
        <ConsoleSection
          title="Network Headers"
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

        {/* Query Controller */}
        <ConsoleSection
          title="Search Parameters"
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

        {/* Request Data Section */}
        {BODY_METHODS.has(endpoint.method) && (
          <ConsoleSection
            title="Payload"
            action={
              <div className="flex items-center gap-4">
                {bodyType === "form" && (
                  <AddButton
                    onClick={() => setFormRows((prev) => [...prev, ["", ""]])}
                  />
                )}
                <div className="flex p-1 bg-secondary rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setBodyType("json")}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                      bodyType === "json"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyType("form")}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                      bodyType === "form"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    FORM
                  </button>
                </div>
              </div>
            }
          >
            {bodyType === "json" ? (
              <div className="relative group/editor">
                <div className="absolute -inset-1 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover/editor:opacity-100 transition duration-500" />
                <textarea
                  className="relative w-full h-64 bg-secondary rounded-2xl p-6 outline-none border border-border focus:border-primary/30 resize-none leading-relaxed text-foreground transition-all font-mono text-[12px] placeholder:text-muted-foreground/30"
                  value={bodyText}
                  onChange={(event) => setBodyText(event.target.value)}
                  spellCheck={false}
                  placeholder={` "payload": "..." `}
                />
              </div>
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

        {/* Terminal Response Area */}
        <ResponseTerminal
          response={response}
          onClear={() => setResponse(null)}
        />
      </div>

      {/* Persistence Action Layer */}
      <TryActionFooter onSend={send} loading={loading} />
    </div>
  );
}
