import type {
  EndpointInfo,
  HealthResponse,
  LogsResponse,
  RequestLog,
} from "../types.js";

const BASE = "/__simapi";

export const api = {
  health: () => fetch(`${BASE}/health`).then<HealthResponse>((r) => r.json()),
  endpoints: () =>
    fetch(`${BASE}/endpoints`).then<EndpointInfo[]>((r) => r.json()),
  logs: (limit = 100, offset = 0) =>
    fetch(`${BASE}/logs?limit=${limit}&offset=${offset}`).then<LogsResponse>(
      (r) => r.json()
    ),
  deleteLog: (id: number) =>
    fetch(`${BASE}/logs/${id}`, { method: "DELETE" }).then((r) => r.json()),
  send: (method: string, path: string, body?: unknown) =>
    fetch(path, {
      method,
      headers: body !== undefined ? { "content-type": "application/json" } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};

export function connectSSE(onEntry: (log: RequestLog) => void): () => void {
  const es = new EventSource(`${BASE}/logs/stream`);
  es.addEventListener("log", (e: MessageEvent) => {
    try {
      onEntry(JSON.parse(e.data as string) as RequestLog);
    } catch {
      // malformed SSE data — ignore
    }
  });
  return () => es.close();
}
