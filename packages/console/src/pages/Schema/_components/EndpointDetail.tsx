import { useState } from "react";
import type { EndpointInfo } from "../../../types.js";
import type { AuthState } from "../_types.js";
import { SchemaView } from "./SchemaView.js";
import { TryPanel } from "./TryPanel.js";

export function EndpointDetail({
  endpoint,
  auth,
  onAuthChange,
}: {
  endpoint: EndpointInfo;
  auth: AuthState;
  onAuthChange: (auth: AuthState) => void;
}) {
  const [activeTab, setActiveTab] = useState<"docs" | "try">("docs");

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-[#0c1117]">
      {/* Mobile Sticky Header Tabs */}
      <div className="lg:hidden flex items-center justify-center p-2 bg-white/80 dark:bg-[#0c1117]/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800/50 sticky top-0 z-20">
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl w-full max-w-sm">
          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === "docs"
                ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "text-zinc-400"
            }`}
          >
            Documentation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("try")}
            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === "try"
                ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "text-zinc-400"
            }`}
          >
            Try It Out
          </button>
        </div>
      </div>

      {/* Left Column: Documentation Area */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 bg-white dark:bg-[#0c1117] ${
          activeTab === "docs" ? "block" : "hidden lg:block"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-12 py-12 sm:py-20">
          <header className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-500/30" />
              <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.2em]">
                API Reference
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              {endpoint.title || "Untitled Endpoint"}
            </h1>
          </header>

          <SchemaView endpoint={endpoint} />
        </div>
      </div>

      {/* Right Column: Interactive Console Area */}
      <div
        className={`lg:w-[480px] xl:w-[580px] shrink-0 flex flex-col h-full bg-[#fbfbfc] dark:bg-[#0d1117] border-l border-zinc-100 dark:border-zinc-800/60 shadow-2xl z-10 ${
          activeTab === "try" ? "block" : "hidden lg:block"
        }`}
      >
        <TryPanel endpoint={endpoint} auth={auth} onAuthChange={onAuthChange} />
      </div>
    </div>
  );
}
