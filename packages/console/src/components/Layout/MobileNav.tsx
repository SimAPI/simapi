interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export function MobileNav({
  nav,
  currentTab,
  onTabChange,
}: {
  nav: NavItem[];
  currentTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 h-14 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex z-40 safe-area-inset-bottom">
      {nav.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTabChange(item.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentTab === item.id
              ? "text-cyan-600 dark:text-cyan-400"
              : "text-zinc-400 dark:text-zinc-500 active:text-zinc-600 dark:active:text-zinc-300"
          }`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
