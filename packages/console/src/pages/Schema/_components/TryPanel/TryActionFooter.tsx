interface TryActionFooterProps {
  onSend: () => void;
  loading: boolean;
}

export function TryActionFooter({ onSend, loading }: TryActionFooterProps) {
  return (
    <div className="px-8 py-8 border-t border-border bg-background/80 dark:bg-black/80 backdrop-blur-2xl sticky bottom-0 z-20">
      <button
        type="button"
        onClick={onSend}
        disabled={loading}
        className="group relative w-full h-14 bg-foreground text-background font-black rounded-2xl transition-all active:scale-[0.98] shadow-2xl shadow-black/10 flex items-center justify-center gap-4 overflow-hidden disabled:opacity-50"
      >
        <div className="absolute inset-0 bg-linear-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity" />

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="size-1.5 rounded-full bg-current animate-bounce" />
            <div className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
            <div className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
          </div>
        ) : (
          <>
            <span className="tracking-[0.3em] uppercase text-[11px]">
              Execute Request
            </span>
            <div className="flex items-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-mono border border-current/20 px-2 py-0.5 rounded-lg">
                CMD
              </span>
              <span className="text-[10px] font-mono border border-current/20 px-2 py-0.5 rounded-lg text-sm">
                ↵
              </span>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
