import type { ReactNode } from "react";

export function ConsoleSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <ConsoleLabel>{title}</ConsoleLabel>
        {action}
      </div>
      <div className="pl-1">{children}</div>
    </section>
  );
}

export function ConsoleLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <h3 className="text-[11px] font-black text-foreground/60 dark:text-foreground/40 uppercase tracking-[0.2em] whitespace-nowrap">
        {children}
      </h3>
      <div className="h-px bg-border/50 flex-1" />
    </div>
  );
}

export function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:text-primary/80 transition-all uppercase tracking-widest hover:translate-x-0.5 active:scale-95"
    >
      <svg
        className="size-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        role="img"
        aria-label="Add"
      >
        <title>Add</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add
    </button>
  );
}
