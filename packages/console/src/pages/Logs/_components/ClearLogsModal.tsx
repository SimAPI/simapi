import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button.js";
import { Input } from "../../../components/ui/Input.js";

export function ClearLogsModal({
  pin,
  count,
  onConfirm,
  onClose,
}: {
  pin: string;
  count: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleConfirm = async () => {
    setClearing(true);
    try {
      await onConfirm();
    } finally {
      setClearing(false);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop
    <div
      ref={overlayRef}
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-card-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="text-error text-lg leading-none font-black tracking-tighter">
              ⊗
            </span>
            <h2 className="font-black text-foreground text-sm uppercase tracking-tight">
              Clear all logs
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-black text-foreground">
              {count} {count === 1 ? "entry" : "entries"}
            </span>
            . This cannot be undone.
          </p>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="rounded-xl bg-secondary border border-border px-4 py-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
              Confirmation PIN
            </p>
            <p className="font-mono text-3xl font-black tracking-[0.25em] text-foreground">
              {pin}
            </p>
          </div>

          <div>
            <label
              htmlFor="clear-logs-pin"
              className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2"
            >
              Enter PIN to confirm
            </label>
            <Input
              id="clear-logs-pin"
              autoFocus
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={input}
              onChange={(event) =>
                setInput(event.target.value.replace(/\D/g, ""))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && input === pin) handleConfirm();
              }}
              placeholder="______"
              className="w-full text-center text-lg tracking-[0.25em] font-black"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleConfirm}
              disabled={input !== pin || clearing}
            >
              {clearing ? "Clearing…" : "Clear All Logs"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
