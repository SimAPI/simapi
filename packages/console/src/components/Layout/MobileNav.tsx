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
    <nav className="sm:hidden fixed bottom-0 inset-x-0 h-16 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md flex z-40 pb-safe">
      {nav.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTabChange(item.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
            currentTab === item.id
              ? "text-cyan-600 dark:text-cyan-400 font-bold"
              : "text-zinc-400 dark:text-zinc-600 active:scale-95"
          }`}
        >
          <span
            className={`text-xl leading-none ${currentTab === item.id ? "opacity-100" : "opacity-40"}`}
          >
            {item.icon}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-black">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
