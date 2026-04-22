import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import type { EndpointInfo } from "../types.js";
import { EndpointDetail } from "./Schema/_components/EndpointDetail.js";
import { EndpointList } from "./Schema/_components/EndpointList.js";
import { DEFAULT_AUTH, type AuthState } from "./Schema/_types.js";
import { downloadBlob } from "./Schema/_utils.js";
import { Input } from "../components/ui/Input.js";

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
    function onClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [exportOpen]);

  const exportAs = async (format: "json" | "yaml") => {
    setExportOpen(false);
    try {
      const res = await fetch(`/__simapi/openapi.${format}`);
      const text = await res.text();
      const mime = format === "json" ? "application/json" : "text/yaml";
      downloadBlob(text, `simapi-openapi.${format}`, mime);
    } catch (err) {
      console.error("[SimAPI] Export failed:", err);
    }
  };

  const filtered = search
    ? endpoints.filter(
        (e) =>
          e.path.toLowerCase().includes(search.toLowerCase()) ||
          e.method.toLowerCase().includes(search.toLowerCase()) ||
          (e.title ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : endpoints;

  const showList = !selected;

  return (
    <div className="flex flex-1 overflow-hidden min-h-0">
      <div
        className={`${
          showList ? "flex" : "hidden sm:flex"
        } w-full sm:w-72 sm:shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden`}
      >
        <div className="px-3 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h1 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Schema & Try
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                {filtered.length}
              </span>
              <div ref={exportRef} className="relative">
                <button
                  type="button"
                  onClick={() => setExportOpen((o) => !o)}
                  className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                >
                  Export ▾
                </button>
                {exportOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-20">
                    <button
                      type="button"
                      onClick={() => exportAs("json")}
                      className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      OpenAPI 3.0 JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => exportAs("yaml")}
                      className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-100 dark:border-zinc-800"
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
            onChange={(e) => setSearch(e.target.value)}
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
            <div className="sm:hidden flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-sm text-cyan-600 dark:text-cyan-400 font-medium active:opacity-70 transition-opacity"
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
