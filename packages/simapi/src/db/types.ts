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
  log(entry: Omit<RequestLogEntry, "id">): Promise<void>;
  getLogs(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<RequestLogEntry[]>;
  close(): Promise<void>;
}
