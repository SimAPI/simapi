import { useState } from "react";
import type { EndpointInfo } from "../../../types.js";
import { METHOD_ACCENT } from "../_constants.js";
import type { AuthState } from "../_types.js";
import { SchemaView } from "./SchemaView.js";
import { TryPanel } from "./TryPanel.js";

type DetailTab = "docs" | "try";

export function EndpointDetail({
  endpoint,
  auth,
  onAuthChange,
}: {
  endpoint: EndpointInfo;
  auth: AuthState;
  onAuthChange: (auth: AuthState) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("docs");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${METHOD_ACCENT[endpoint.method] ?? "text-zinc-500"} border-current bg-current/5`}
            >
              {endpoint.method}
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {endpoint.title || endpoint.path}
            </h2>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setTab("docs")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                tab === "docs"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Schema
            </button>
            <button
              type="button"
              onClick={() => setTab("try")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                tab === "try"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Try it
            </button>
          </div>
        </div>
        <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 truncate">
          {endpoint.path}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 px-6 py-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        <div className="max-w-3xl">
          {tab === "docs" ? (
            <SchemaView endpoint={endpoint} />
          ) : (
            <TryPanel
              endpoint={endpoint}
              auth={auth}
              onAuthChange={onAuthChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
