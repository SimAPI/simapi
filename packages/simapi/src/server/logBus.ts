import { EventEmitter } from "node:events";

import type { DbAdapter, RequestLogEntry } from "../db/types.js";

export class LogBus extends EventEmitter implements DbAdapter {
  constructor(private readonly adapter: DbAdapter) {
    super();
    this.setMaxListeners(100);
  }

  async log(entry: Omit<RequestLogEntry, "id">): Promise<number> {
    const id = await this.adapter.log(entry);
    this.emit("entry", { ...entry, id });
    return id;
  }

  getLogs(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<RequestLogEntry[]> {
    return this.adapter.getLogs(opts);
  }

  deleteLog(id: number): Promise<void> {
    return this.adapter.deleteLog(id);
  }

  clearLogs(): Promise<void> {
    return this.adapter.clearLogs();
  }

  async close(): Promise<void> {
    this.removeAllListeners();
    return this.adapter.close();
  }
}
