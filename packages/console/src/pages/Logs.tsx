import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { api, connectSSE } from "../lib/api.js";
import type { RequestLog } from "../types.js";
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
      .then((response) => setLogs(response.data))
      .catch(console.error);

    const disconnectSSE = connectSSE((entry) => {
      setLogs((previousLogs) => [entry, ...previousLogs].slice(0, 500));
    });

    return disconnectSSE;
  }, []);

  const filtered = filter
    ? logs.filter(
        (log) =>
          log.path.includes(filter) ||
          log.method.toLowerCase().startsWith(filter.toLowerCase())
      )
    : logs;

  const exportJson = () => {
    downloadBlob(
      JSON.stringify(filtered, null, 2),
      "simapi-logs.json",
      "application/json"
    );
  };

  const handleDelete = (id: number) => {
    setLogs((previousLogs) => previousLogs.filter((log) => log.id !== id));
  };

  const handleClearAll = async () => {
    await api.clearLogs();
    setLogs([]);
    setClearPin(null);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 sm:px-6 py-3 border-b border-border flex flex-wrap items-center gap-2 bg-card shrink-0">
        <h1 className="font-black text-foreground mr-1 uppercase tracking-tight">
          Request Logs
        </h1>
        <Input
          className="flex-1 sm:flex-none sm:w-48"
          placeholder="Filter…"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={exportJson}
          className="font-black"
        >
          Export
        </Button>
        {logs.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setClearPin(genPin())}
            className="font-black"
          >
            Clear All
          </Button>
        )}
        <span className="text-xs text-muted-foreground/50 font-black font-mono ml-auto tracking-widest uppercase">
          {filtered.length} entries
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-background px-6">
        {filtered.length === 0 ? (
          <div className="px-4 py-20 text-center">
            <p className="text-border text-3xl mb-3">≡</p>
            <p className="text-muted-foreground text-sm font-black uppercase tracking-tight">
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
