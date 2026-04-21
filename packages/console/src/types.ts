export interface HealthResponse {
  ok: boolean;
  version: string;
  name: string;
  endpointCount: number;
  logging: boolean;
}

export interface JsonSchemaProperty {
  type?: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
}

export interface JsonSchema {
  type: "object";
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface EndpointInfo {
  method: string;
  path: string;
  type: "open" | "secure";
  title?: string;
  description?: string;
  schema?: JsonSchema;
}

export interface RequestLog {
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

export interface LogsResponse {
  data: RequestLog[];
  limit: number;
  offset: number;
}
