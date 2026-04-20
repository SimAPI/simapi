export interface HealthResponse {
  ok: boolean;
  version: string;
  name: string;
  endpointCount: number;
  logging: boolean;
}

export interface EndpointInfo {
  method: string;
  path: string;
  type: "open" | "secure";
}

export interface RequestLog {
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

export interface LogsResponse {
  data: RequestLog[];
  limit: number;
  offset: number;
}
