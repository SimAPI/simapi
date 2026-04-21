export interface RequestLogEntry {
  id: number;
  method: string;
  path: string;
  query: string;
  requestHeaders: string;
  requestBody: string;
  responseStatus: number;
  responseBody: string;
  durationMs: number;
  timestamp: string;
}

export interface DbAdapter {
  log(entry: Omit<RequestLogEntry, "id">): Promise<number>;
  getLogs(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<RequestLogEntry[]>;
  deleteLog(id: number): Promise<void>;
  clearLogs(): Promise<void>;
  close(): Promise<void>;
}
