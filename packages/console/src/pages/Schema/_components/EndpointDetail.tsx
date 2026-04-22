import { useState } from "react";
import type { EndpointInfo } from "../../../types.js";
import type { AuthState } from "../_types.js";
import { SchemaView } from "./SchemaView.js";
import { TryPanel } from "./TryPanel.js";
import { METHOD_COLORS } from "../_constants.js";

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
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-[#08090a]">
      {/* Mobile Floating Action Tab */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 dark:bg-white/10 backdrop-blur-2xl px-2 py-2 rounded-2xl border border-white/10 shadow-2xl flex gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("docs")}
          className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === "docs"
              ? "bg-white text-black shadow-lg"
              : "text-white/40"
          }`}
        >
          Reference
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("try")}
          className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === "try"
              ? "bg-white text-black shadow-lg"
              : "text-white/40"
          }`}
        >
          Console
        </button>
      </div>

      {/* Left/Middle Column: High-End Documentation */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-none bg-white dark:bg-[#08090a] ${
          activeTab === "docs" ? "block" : "hidden lg:block"
        }`}
      >
        <div className="max-w-4xl mx-auto px-8 sm:px-16 py-16 sm:py-24 space-y-24">
          <header className="relative">
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-linear-to-b from-cyan-500/50 via-transparent to-transparent hidden sm:block" />
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.4em] px-3 py-1 bg-cyan-50 dark:bg-cyan-500/10 rounded-full">
                Endpoint Reference
              </span>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[0.9]">
                {endpoint.title || "Request Interface"}
              </h1>
              <div className="flex items-center gap-4 py-4 px-6 bg-zinc-50 dark:bg-white/3 rounded-2xl border border-zinc-100 dark:border-white/5 w-fit">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                    METHOD_COLORS[endpoint.method] ||
                    "text-zinc-400 border-zinc-200"
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
                  {endpoint.path}
                </code>
              </div>
            </div>
          </header>

          <SchemaView endpoint={endpoint} />

          <footer className="pt-24 border-t border-zinc-100 dark:border-white/5">
            <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-widest">
              Generated via SimAPI Engine
            </p>
          </footer>
        </div>
      </div>

      {/* Right Column: Integrated Overlay Console */}
      <div
        className={`lg:w-[500px] xl:w-[600px] shrink-0 h-full border-l border-zinc-100 dark:border-white/5 bg-[#fdfdfd] dark:bg-[#090a0b] shadow-[-20px_0_40px_rgba(0,0,0,0.02)] dark:shadow-none z-10 ${
          activeTab === "try" ? "block" : "hidden lg:block"
        }`}
      >
        <TryPanel endpoint={endpoint} auth={auth} onAuthChange={onAuthChange} />
      </div>
    </div>
  );
}
