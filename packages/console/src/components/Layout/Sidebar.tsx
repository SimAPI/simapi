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
    <aside className="hidden sm:flex w-56 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-[#fbfbfc] dark:bg-[#0d1117]">
      {/* Logo */}
      <div className="px-6 py-6">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] transition-colors ${
              currentTab === item.id
                ? "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-bold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <span
              className={`text-lg leading-none w-5 text-center shrink-0 ${
                currentTab === item.id ? "opacity-100" : "opacity-40"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
        <code className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tighter">
          SIMAPI V0.0.8
        </code>
        <button
          type="button"
          onClick={onToggleDark}
          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all active:scale-90"
        >
          {isDark ? "☀" : "◑"}
        </button>
      </div>
    </aside>
  );
}
