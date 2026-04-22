import { useEffect, useState } from "react";
import { api, connectSSE } from "../lib/api.js";
import type { RequestLog } from "../types.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { ClearLogsModal } from "./Logs/_components/ClearLogsModal.js";
import { LogModal } from "./Logs/_components/LogModal.js";
import { LogTable } from "./Logs/_components/LogTable.js";
import { downloadBlob, genPin } from "./Logs/_utils.js";

export default function Logs() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [selected, setSelected] = useState<RequestLog | null>(null);
  const [filter, setFilter] = useState("");
  const [clearPin, setClearPin] = useState<string | null>(null);

  useEffect(() => {
    api
      .logs(200)
      .then((r) => setLogs(r.data))
      .catch(console.error);

    const disconnect = connectSSE((entry) => {
      setLogs((prev) => [entry, ...prev].slice(0, 500));
    });

    return disconnect;
  }, []);

  const filtered = filter
    ? logs.filter(
        (l) =>
          l.path.includes(filter) ||
          l.method.toLowerCase().startsWith(filter.toLowerCase()),
      )
    : logs;

  const exportJson = () => {
    downloadBlob(
      JSON.stringify(filtered, null, 2),
      "simapi-logs.json",
      "application/json",
    );
  };

  const handleDelete = (id: number) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleClearAll = async () => {
    await api.clearLogs();
    setLogs([]);
    setClearPin(null);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-900 shrink-0">
        <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 mr-1">
          Request Logs
        </h1>
        <Input
          className="flex-1 sm:flex-none sm:w-48"
          placeholder="Filter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Button variant="secondary" size="sm" onClick={exportJson}>
          Export
        </Button>
        {logs.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setClearPin(genPin())}
          >
            Clear All
          </Button>
        )}
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono ml-auto">
          {filtered.length} entries
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-20 text-center">
            <p className="text-zinc-300 dark:text-zinc-600 text-3xl mb-3">≡</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              {filter
                ? "No entries match your filter."
                : "No requests logged yet — make a request to your API."}
            </p>
          </div>
        ) : (
          <LogTable logs={filtered} onSelect={setSelected} />
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <LogModal
          log={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Clear All Confirmation */}
      {clearPin && (
        <ClearLogsModal
          pin={clearPin}
          count={logs.length}
          onConfirm={handleClearAll}
          onClose={() => setClearPin(null)}
        />
      )}
    </div>
  );
}
