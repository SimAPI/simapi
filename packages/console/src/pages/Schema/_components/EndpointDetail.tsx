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
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Mobile Floating Action Tab */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground dark:bg-muted/80 backdrop-blur-2xl px-2 py-2 rounded-2xl border border-border/10 shadow-2xl flex gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("docs")}
          className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === "docs"
              ? "bg-background text-foreground shadow-lg"
              : "text-background/40 dark:text-foreground/40"
          }`}
        >
          Reference
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("try")}
          className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === "try"
              ? "bg-background text-foreground shadow-lg"
              : "text-background/40 dark:text-foreground/40"
          }`}
        >
          Console
        </button>
      </div>

      {/* Left/Middle Column: High-End Documentation */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-none bg-background ${
          activeTab === "docs" ? "block" : "hidden lg:block"
        }`}
      >
        <div className="max-w-4xl mx-auto px-8 sm:px-16 py-16 sm:py-24 space-y-24">
          <header className="relative">
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-linear-to-b from-cyan-500/50 via-transparent to-transparent hidden sm:block" />
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                Endpoint Reference
              </span>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-[0.9]">
                {endpoint.title || "Request Interface"}
              </h1>
              <div className="flex items-center gap-4 py-4 px-6 bg-secondary rounded-2xl border border-border w-fit">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                    METHOD_COLORS[endpoint.method] ||
                    "text-muted-foreground border-border"
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono text-muted-foreground">
                  {endpoint.path}
                </code>
              </div>
            </div>
          </header>

          <SchemaView endpoint={endpoint} />

          <footer className="pt-24 border-t border-border/50">
            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
              Generated via SimAPI Engine
            </p>
          </footer>
        </div>
      </div>

      {/* Right Column: Integrated Overlay Console */}
      <div
        className={`lg:w-[500px] xl:w-[600px] shrink-0 h-full border-l border-border bg-background shadow-[-20px_0_40px_rgba(0,0,0,0.02)] dark:shadow-none z-10 ${
          activeTab === "try" ? "block" : "hidden lg:block"
        }`}
      >
        <TryPanel endpoint={endpoint} auth={auth} onAuthChange={onAuthChange} />
      </div>
    </div>
  );
}
