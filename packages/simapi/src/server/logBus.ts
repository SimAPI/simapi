import { EventEmitter } from "node:events";

import type { DbAdapter, RequestLogEntry } from "../db/types.js";

export class LogBus extends EventEmitter implements DbAdapter {
  constructor(private readonly adapter: DbAdapter) {
    super();
    this.setMaxListeners(100);
  }

  async log(entry: Omit<RequestLogEntry, "id">): Promise<void> {
    await this.adapter.log(entry);
    this.emit("entry", entry);
  }

  getLogs(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<RequestLogEntry[]> {
    return this.adapter.getLogs(opts);
  }

  async close(): Promise<void> {
    this.removeAllListeners();
    return this.adapter.close();
  }
}
