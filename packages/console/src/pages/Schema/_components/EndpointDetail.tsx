import { useState } from "react";
import type { EndpointInfo } from "../../../types.js";
import { METHOD_COLORS } from "../_constants.js";
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
  const [copied, setCopied] = useState(false);

  const fullUrl = `${window.location.origin}${endpoint.path}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-none bg-background">
        <div className="max-w-4xl mx-auto px-8 py-16 sm:py-24 space-y-12">
          <header className="relative">
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-linear-to-b from-primary/50 via-transparent to-transparent hidden sm:block" />
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                Endpoint Reference
              </span>
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-[0.9]">
                {endpoint.title || "Request Interface"}
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-secondary rounded-2xl border border-border">
                <span
                  className={`w-fit text-[10px] font-black px-2 py-0.5 rounded border uppercase shrink-0 ${
                    METHOD_COLORS[endpoint.method] ||
                    "text-muted-foreground border-border"
                  }`}
                >
                  {endpoint.method}
                </span>
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <code className="text-sm font-mono text-muted-foreground overflow-x-auto">
                    {fullUrl}
                  </code>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 hover:bg-background rounded-xl transition-all active:scale-95 shrink-0 group"
                    title="Copy URL"
                  >
                    {copied ? (
                      <span className="text-[10px] font-black text-success uppercase tracking-widest">
                        Copied
                      </span>
                    ) : (
                      <svg
                        className="size-4 text-muted-foreground group-hover:text-foreground transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        role="img"
                        aria-label="Copy"
                      >
                        <title>Copy</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Tab Selection */}
          <div className="flex p-1 bg-secondary rounded-2xl border border-border w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("docs")}
              className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === "docs"
                  ? "bg-background text-foreground shadow-lg shadow-black/5"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              Reference
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("try")}
              className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === "try"
                  ? "bg-background text-foreground shadow-lg shadow-black/5"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              Console
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "docs" ? (
              <SchemaView endpoint={endpoint} />
            ) : (
              <div className="bg-card rounded-3xl border border-border overflow-hidden">
                <TryPanel
                  endpoint={endpoint}
                  auth={auth}
                  onAuthChange={onAuthChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
