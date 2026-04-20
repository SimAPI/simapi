import { useState } from "react";

import Logs from "./pages/Logs.js";
import Overview from "./pages/Overview.js";
import Schema from "./pages/Schema.js";
import Try from "./pages/Try.js";

const TABS = ["Overview", "Logs", "Schema", "Try"] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono text-sm">
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center gap-6">
        <span className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">
          SimAPI Console
        </span>
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded text-sm transition-colors ${
                t === tab
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main className="p-6">
        {tab === "Overview" && <Overview />}
        {tab === "Logs" && <Logs />}
        {tab === "Schema" && <Schema />}
        {tab === "Try" && <Try />}
      </main>
    </div>
  );
}
