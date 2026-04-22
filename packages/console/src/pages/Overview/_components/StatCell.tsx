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
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1 font-medium">
        {label}
      </p>
      <p
        className={`text-base font-semibold leading-none ${
          accent === true
            ? "text-emerald-600 dark:text-emerald-400"
            : accent === false
              ? "text-zinc-400 dark:text-zinc-500"
              : "text-zinc-900 dark:text-zinc-100"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{sub}</p>
      )}
    </div>
  );
}
