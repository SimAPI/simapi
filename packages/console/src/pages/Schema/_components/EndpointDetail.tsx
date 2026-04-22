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
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-[#0d1117]">
      {/* Left Column: Documentation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 bg-white dark:bg-[#0c1117] border-r border-zinc-100 dark:border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-10 py-16">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-12 tracking-tight">
            {endpoint.title || "Endpoint"}
          </h1>
          <SchemaView endpoint={endpoint} />
        </div>
      </div>

      {/* Right Column: Console */}
      <div className="lg:w-[450px] xl:w-[550px] shrink-0 bg-[#0d1117] flex flex-col h-full">
        <TryPanel
          endpoint={endpoint}
          auth={auth}
          onAuthChange={onAuthChange}
        />
      </div>
    </div>
  );
}
