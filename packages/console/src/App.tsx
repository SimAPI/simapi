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
        <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
              S
            </div>
            <div>
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-none">
                SimAPI
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none mt-0.5 font-mono tracking-wide">
                CONSOLE
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                tab === item.id
                  ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-medium shadow-[inset_2px_0_0_0] shadow-cyan-400 dark:shadow-cyan-600"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <span
                className={`font-mono text-sm leading-none w-4 text-center shrink-0 ${
                  tab === item.id ? "text-cyan-500" : ""
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
          <code className="text-[10px] text-zinc-300 dark:text-zinc-600 font-mono truncate">
            /__simapi
          </code>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "☀" : "◑"}
          </button>
        </div>
      </aside>

      {/* Main — overflow-hidden so child pages control their own scroll */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {tab === "overview" && <Overview />}
        {tab === "logs" && <Logs />}
        {tab === "schema" && <Schema />}
      </main>
    </div>
  );
}
