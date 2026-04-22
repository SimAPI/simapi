import { Logo } from "./Logo.js";

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export function Sidebar({
  nav,
  currentTab,
  onTabChange,
  isDark,
  onToggleDark,
}: {
  nav: NavItem[];
  currentTab: string;
  onTabChange: (id: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
}) {
  return (
    <aside className="hidden sm:flex w-56 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
              currentTab === item.id
                ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-medium shadow-[inset_2px_0_0_0] shadow-cyan-400 dark:shadow-cyan-600"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <span
              className={`font-mono text-sm leading-none w-4 text-center shrink-0 ${
                currentTab === item.id ? "text-cyan-500" : ""
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
          onClick={onToggleDark}
          className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? "☀" : "◑"}
        </button>
      </div>
    </aside>
  );
}
