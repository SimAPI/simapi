export function StatCell({
  label,
  value,
  sub,
  accent,
  mono,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <p className="text-[10px] text-muted-foreground mb-1 font-black uppercase tracking-widest">
        {label}
      </p>
      <p
        className={`text-lg font-black leading-none tracking-tight ${
          accent === true
            ? "text-success"
            : accent === false
              ? "text-muted-foreground/40"
              : "text-foreground"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-muted-foreground/50 mt-1 font-black uppercase tracking-widest">
          {sub}
        </p>
      )}
    </div>
  );
}
