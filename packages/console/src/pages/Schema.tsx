import { useEffect, useRef, useState } from "react";
import { Input } from "../components/ui/Input.js";
import { api } from "../lib/api.js";
import type { EndpointInfo } from "../types.js";
import { EndpointDetail } from "./Schema/_components/EndpointDetail.js";
import { EndpointList } from "./Schema/_components/EndpointList.js";
import { type AuthState, DEFAULT_AUTH } from "./Schema/_types.js";
import { downloadBlob } from "./Schema/_utils.js";

export default function Schema() {
  const [endpoints, setEndpoints] = useState<EndpointInfo[]>([]);
  const [selected, setSelected] = useState<EndpointInfo | null>(null);
  const [search, setSearch] = useState("");
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem("simapi-console-auth");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return { ...DEFAULT_AUTH };
  });

  useEffect(() => {
    localStorage.setItem("simapi-console-auth", JSON.stringify(auth));
  }, [auth]);

  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.endpoints().then(setEndpoints).catch(console.error);
  }, []);

  useEffect(() => {
    if (!exportOpen) return;
    function onClickOutside(event: MouseEvent) {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [exportOpen]);

  const exportAs = async (format: "json" | "yaml") => {
    setExportOpen(false);
    try {
      const response = await fetch(`/__simapi/openapi.${format}`);
      const text = await response.text();
      const mime = format === "json" ? "application/json" : "text/yaml";
      downloadBlob(text, `simapi-openapi.${format}`, mime);
    } catch (error) {
      console.error("[SimAPI] Export failed:", error);
    }
  };

  const filtered = search
    ? endpoints.filter(
        (endpoint) =>
          endpoint.path.toLowerCase().includes(search.toLowerCase()) ||
          endpoint.method.toLowerCase().includes(search.toLowerCase()) ||
          (endpoint.title ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : endpoints;

  const showList = !selected;

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      <div
        className={`${
          showList ? "flex" : "hidden sm:flex"
        } w-full sm:w-72 sm:shrink-0 flex-col border-r border-border bg-card overflow-hidden`}
      >
        <div className="px-3 py-3 border-b border-border shrink-0 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h1 className="font-black text-sm text-foreground uppercase tracking-tight">
              Interface
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/50 font-mono">
                {filtered.length}
              </span>
              <div ref={exportRef} className="relative">
                <button
                  type="button"
                  onClick={() => setExportOpen((isOpen) => !isOpen)}
                  className="text-[10px] font-black text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border bg-secondary/50 hover:bg-secondary transition-colors uppercase tracking-widest"
                >
                  Export ▾
                </button>
                {exportOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                    <button
                      type="button"
                      onClick={() => exportAs("json")}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                    >
                      OpenAPI 3.0 JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => exportAs("yaml")}
                      className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors border-t border-border"
                    >
                      OpenAPI 3.0 YAML
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Input
            className="w-full"
            placeholder="Search endpoints…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <EndpointList
          endpoints={filtered}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      <div
        className={`${
          selected ? "flex" : "hidden sm:flex"
        } flex-1 overflow-hidden flex-col min-w-0`}
      >
        {selected ? (
          <>
            <div className="sm:hidden flex items-center gap-2 px-4 py-3 border-b border-border bg-card shrink-0">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-sm text-primary font-black uppercase tracking-widest active:opacity-70 transition-opacity"
              >
                <span className="text-lg leading-none">‹</span>
                Endpoints
              </button>
            </div>
            <EndpointDetail
              key={`${selected.method}-${selected.path}`}
              endpoint={selected}
              auth={auth}
              onAuthChange={setAuth}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center max-w-xs px-6">
              <p className="text-border text-5xl mb-4">◈</p>
              <p className="text-foreground text-sm font-black uppercase tracking-tight mb-1">
                Select an endpoint
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                View its schema, request validation, and try it live in the
                console.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
