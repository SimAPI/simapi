import type { AppRequest } from "./AppRequest.js";
import type { AppResponse } from "./AppResponse.js";
import type { ValidationFormat } from "./ValidationErrors.js";

export type AuthHandler = (req: AppRequest) => AppResponse | undefined;

export type DatabaseConfig =
  | { type: "sqlite"; path: string }
  | { type: "libsql"; url: string; authToken: string }
  | { type: "postgres"; url: string }
  | { type: "none" };

export interface SimAPIConfig {
  name: string;
  description?: string;
  port?: number;
  authHandler?: AuthHandler;
  logEntries?: boolean;
  database?: DatabaseConfig;
  autoThrowValidationErrors?: ValidationFormat | false | null;
}

export function defineConfig(config: SimAPIConfig): SimAPIConfig {
  return config;
}
