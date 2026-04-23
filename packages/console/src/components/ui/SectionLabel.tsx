import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
      {children}
    </h3>
  );
}
