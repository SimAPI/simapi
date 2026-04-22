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
    <aside className="hidden sm:flex w-64 shrink-0 flex-col border-r border-zinc-100 dark:border-zinc-800/50 bg-[#f9f9fb] dark:bg-[#0c1117] transition-all">
      {/* Logo & Branding */}
      <div className="px-7 py-8 mb-4">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-none">
        <div className="px-3 mb-4">
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
            Menu
          </span>
        </div>
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-left text-[13px] transition-all group ${
              currentTab === item.id
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm border border-zinc-100 dark:border-zinc-700/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/30"
            }`}
          >
            <span
              className={`text-xl leading-none transition-transform group-hover:scale-110 ${
                currentTab === item.id
                  ? "opacity-100"
                  : "opacity-40 group-hover:opacity-100"
              }`}
            >
              {item.icon}
            </span>
            <span className="tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer / System Status */}
      <div className="px-6 py-6 border-t border-zinc-100 dark:border-zinc-800/50 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
              Version
            </span>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-bold">
              0.0.8-BETA
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleDark}
            className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 border border-zinc-100 dark:border-zinc-700/50 shadow-sm transition-all active:scale-90"
            aria-label="Toggle theme"
          >
            {isDark ? "☀" : "◑"}
          </button>
        </div>
      </div>
    </aside>
  );
}
