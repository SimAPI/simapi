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
    <aside className="hidden sm:flex w-[72px] shrink-0 flex-col bg-card border-r border-card-border transition-all duration-500 group/sidebar hover:w-64">
      {/* Branding Dock */}
      <div className="h-20 flex items-center justify-center group-hover/sidebar:justify-start group-hover/sidebar:px-7 transition-all">
        <Logo />
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 flex flex-col items-center group-hover/sidebar:items-start px-3 py-6 space-y-6 overflow-x-hidden">
        <div className="w-full space-y-2">
          <div className="hidden group-hover/sidebar:block px-4 mb-4">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] select-none">
              Command
            </span>
          </div>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-center group-hover/sidebar:justify-start gap-4 h-12 group-hover/sidebar:h-11 px-0 group-hover/sidebar:px-4 rounded-xl text-left transition-all relative ${
                currentTab === item.id
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {currentTab === item.id && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_12px_var(--color-primary)] opacity-60" />
              )}
              <span
                className={`text-2xl group-hover/sidebar:text-xl leading-none transition-all ${
                  currentTab === item.id
                    ? "opacity-100 scale-110"
                    : "opacity-40 group-hover:opacity-70 group-hover:scale-100"
                }`}
              >
                {item.icon}
              </span>
              <span className="hidden group-hover/sidebar:block text-[13px] font-bold tracking-tight whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* System Utility Dock */}
      <div className="p-4 border-t border-border space-y-4">
        <div className="flex flex-col items-center group-hover/sidebar:flex-row group-hover/sidebar:justify-between group-hover/sidebar:px-2 gap-4">
          <button
            type="button"
            onClick={onToggleDark}
            className="size-10 rounded-xl flex items-center justify-center bg-secondary text-muted-foreground hover:text-primary border border-border transition-all active:scale-90"
            aria-label="Toggle theme"
          >
            {isDark ? "☀" : "◑"}
          </button>
        </div>
      </div>
    </aside>
  );
}
