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
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0c1117]">
      {/* Header */}
      <div className="px-6 py-8 border-b border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-[#0c1117] shrink-0">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {endpoint.title || "Endpoint"}
        </h1>
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 w-fit">
          <span
            className={`font-mono text-[10px] font-bold px-2 py-1 rounded ${METHOD_ACCENT[endpoint.method] ?? "text-zinc-500"} bg-current/10 border border-current/20`}
          >
            {endpoint.method}
          </span>
          <code className="text-xs text-zinc-600 dark:text-zinc-300 font-mono">
            {endpoint.path}
          </code>
        </div>
        {endpoint.description && (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
            {endpoint.description}
          </p>
        )}
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        <div className="flex flex-col lg:flex-row min-h-full">
          {/* Left Column: Documentation */}
          <div className="lg:w-[50%] flex-1 px-6 py-8 border-r border-zinc-100 dark:border-zinc-800/60">
            <SchemaView endpoint={endpoint} />
          </div>

          {/* Right Column: Try it & Samples */}
          <div className="w-full lg:w-[50%] bg-zinc-50/50 dark:bg-[#0d1117] px-6 py-8 space-y-6">
            <TryPanel
              endpoint={endpoint}
              auth={auth}
              onAuthChange={onAuthChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
