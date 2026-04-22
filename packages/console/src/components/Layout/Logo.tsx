export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-8 rounded-xl overflow-hidden shrink-0 shadow-sm border border-border/10">
        <img
          src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png"
          alt="SimAPI"
          className="size-full object-cover"
        />
      </div>
      <div className="hidden group-hover/sidebar:block animate-in fade-in slide-in-from-left-2 duration-300">
        <p className="font-black text-sm text-foreground leading-none tracking-tight">
          SimAPI
        </p>
        <p className="text-[9px] text-muted-foreground leading-none mt-1 font-black tracking-[0.2em] uppercase">
          Console
        </p>
      </div>
    </div>
  );
}
