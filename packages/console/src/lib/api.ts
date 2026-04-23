import type {
  EndpointInfo,
  HealthResponse,
  LogsResponse,
  RequestLog,
} from "../types.js";

const BASE = "/__simapi";

export const api = {
  health: () => {
    return fetch(`${BASE}/health`).then<HealthResponse>((r) => r.json());
  },

  endpoints: () => {
    return fetch(`${BASE}/endpoints`).then<EndpointInfo[]>((r) => r.json());
  },

  logs: (limit = 100, offset = 0) => {
    return fetch(
      `${BASE}/logs?limit=${limit}&offset=${offset}`
    ).then<LogsResponse>((r) => r.json());
  },

  deleteLog: (id: number) => {
    return fetch(`${BASE}/logs/${id}`, { method: "DELETE" }).then((r) =>
      r.json()
    );
  },

  clearLogs: () => {
    return fetch(`${BASE}/logs`, { method: "DELETE" }).then((r) => r.json());
  },

  send: (
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ) => {
    const isJsonPayload =
      body !== undefined &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      typeof body !== "string";

    return fetch(path, {
      method,
      headers: {
        ...(isJsonPayload ? { "content-type": "application/json" } : {}),
        ...(headers ?? {}),
      },
      body: isJsonPayload ? JSON.stringify(body) : (body as BodyInit),
    });
  },
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
