export function ResponseRow({
  status,
  description,
  color,
}: {
  status: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${color}`}
    >
      <span className="font-mono font-semibold text-xs w-8 shrink-0">
        {status}
      </span>
      <span className="text-xs">{description}</span>
    </div>
  );
}
