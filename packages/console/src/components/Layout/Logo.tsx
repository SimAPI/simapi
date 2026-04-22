export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const boxSize = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${boxSize} rounded-lg bg-linear-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold ${textSize} shrink-0 shadow-sm`}
      >
        S
      </div>
      <div>
        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-none">
          SimAPI
        </p>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none mt-0.5 font-mono tracking-wide">
          CONSOLE
        </p>
      </div>
    </div>
  );
}
