import { useState } from "react";

interface JsonViewProps {
  data: unknown;
  title?: string;
  copyable?: boolean;
}

export function JsonView({ data, title, copyable = true }: JsonViewProps) {
  const [copied, setCopied] = useState(false);
  const jsonString =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting via regex
  const highlighted = jsonString
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "text-accent"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-foreground font-bold"; // key
          } else {
            cls = "text-primary"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-amber-500"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-rose-500"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );

  return (
    <div className="relative group/json rounded-3xl bg-zinc-900 dark:bg-black border border-border/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-white/2 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-zinc-800" />
            <div className="size-2.5 rounded-full bg-zinc-800" />
            <div className="size-2.5 rounded-full bg-zinc-800" />
          </div>
          {title && (
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {title}
            </span>
          )}
        </div>

        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-[10px] font-black text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            {copied ? (
              <span className="text-emerald-500">Copied!</span>
            ) : (
              <>
                <span>Copy</span>
                <svg
                  className="size-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-8 overflow-x-auto scrollbar-none">
        <pre
          className="text-[13px] leading-relaxed font-mono whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}
