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
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-red-500 text-lg leading-none">⊗</span>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              Clear all logs
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {count} {count === 1 ? "entry" : "entries"}
            </span>
            . This cannot be undone.
          </p>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 px-4 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Confirmation PIN
            </p>
            <p className="font-mono text-3xl font-bold tracking-[0.25em] text-zinc-900 dark:text-zinc-100">
              {pin}
            </p>
          </div>

          <div>
            <label
              htmlFor="clear-logs-pin"
              className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5"
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
              className="w-full text-center text-lg tracking-[0.25em]"
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
