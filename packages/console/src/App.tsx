import { useState } from "react";
import { useDarkMode } from "./hooks/useDarkMode.js";
import Logs from "./pages/Logs.js";
import Overview from "./pages/Overview.js";
import Schema from "./pages/Schema.js";
import { Sidebar } from "./components/Layout/Sidebar.js";
import { MobileNav } from "./components/Layout/MobileNav.js";
import { Logo } from "./components/Layout/Logo.js";

type Tab = "overview" | "logs" | "schema";

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "○" },
  { id: "logs", label: "Logs", icon: "≡" },
  { id: "schema", label: "Schema", icon: "◈" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dark, setDark] = useDarkMode();

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans text-sm overflow-hidden">
      <Sidebar
        nav={NAV}
        currentTab={tab}
        onTabChange={(id) => setTab(id as Tab)}
        isDark={dark}
        onToggleDark={() => setDark(!dark)}
      />

      <main className="flex-1 overflow-hidden flex flex-col min-w-0 pb-14 sm:pb-0">
        {/* Mobile top bar */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {dark ? "☀" : "◑"}
          </button>
        </div>

        {tab === "overview" && <Overview />}
        {tab === "logs" && <Logs />}
        {tab === "schema" && <Schema />}
      </main>

      <MobileNav
        nav={NAV}
        currentTab={tab}
        onTabChange={(id) => setTab(id as Tab)}
      />
    </div>
  );
}
