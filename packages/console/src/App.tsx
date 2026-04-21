import { useEffect, useState } from "react";

import Logs from "./pages/Logs.js";
import Overview from "./pages/Overview.js";
import Schema from "./pages/Schema.js";

type Tab = "overview" | "logs" | "schema";

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "○" },
  { id: "logs", label: "Request Logs", icon: "≡" },
  { id: "schema", label: "Schema & Try", icon: "◈" },
];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("simapi-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("simapi-theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark] as const;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dark, setDark] = useDarkMode();

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans text-sm overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              S
            </div>
            <div>
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-none">
                SimAPI
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-none mt-0.5">
                Console
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                tab === item.id
                  ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <span className="font-mono text-base leading-none w-4 text-center">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">
            /__simapi
          </span>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "☀" : "◑"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {tab === "overview" && <Overview />}
        {tab === "logs" && <Logs />}
        {tab === "schema" && <Schema />}
      </main>
    </div>
  );
}
