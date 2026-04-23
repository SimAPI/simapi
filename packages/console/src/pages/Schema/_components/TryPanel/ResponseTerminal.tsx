import { JsonView } from "../../../../components/ui/JsonView.js";
import { ConsoleLabel } from "./ConsoleElements.js";

interface ResponseTerminalProps {
  response: {
    status: number;
    body: string;
    elapsed: number;
  } | null;
  onClear: () => void;
}

export function ResponseTerminal({ response, onClear }: ResponseTerminalProps) {
  if (!response) return null;

  const statusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-success";
    if (status >= 400) return "text-error";
    return "text-warning";
  };

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <ConsoleLabel>Output Stream</ConsoleLabel>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
            <span
              className={`size-1.5 rounded-full animate-pulse ${statusColor(
                response.status
              )} bg-current`}
            />
            <span
              className={`text-[10px] font-black font-mono ${statusColor(
                response.status
              )} text-current`}
            >
              {response.status}
            </span>
            <span className="w-px h-2.5 bg-border mx-1" />
            <span className="text-[10px] font-black font-mono text-muted-foreground">
              {response.elapsed}ms
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-error transition-colors"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-label="Clear response"
            >
              <title>Clear</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <JsonView data={response.body} title="Stdout" />
    </section>
  );
}
