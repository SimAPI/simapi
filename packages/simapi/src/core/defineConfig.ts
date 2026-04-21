import type { AppRequest } from "./AppRequest.js";
import type { AppResponse } from "./AppResponse.js";
import type { ValidationFormat } from "./ValidationErrors.js";

/**
 * A function that inspects an incoming request and optionally rejects it.
 *
 * - Return an `AppResponse` (e.g. `AppResponse.unauthenticated(...)`) to reject
 *   the request — SimAPI sends that response immediately.
 * - Return `undefined` / `void` to allow the request to proceed.
 *
 * Async handlers are supported.
 *
 * @example
 * const authHandler: AuthHandler = (req) => {
 *   if (!req.header("authorization")) {
 *     return AppResponse.unauthenticated({ message: "Token required" });
 *   }
 * };
 */
export type AuthHandler = (
  req: AppRequest
  // biome-ignore lint/suspicious/noConfusingVoidType: void is intentional — handlers can implicitly return without a value
) => AppResponse | void | Promise<AppResponse | undefined>;

/** Database connection configuration. */
export type DatabaseConfig =
  | { type: "sqlite"; path: string }
  | { type: "libsql"; url: string; authToken: string }
  | { type: "postgres"; url: string }
  | { type: "none" };

/** Configuration object accepted by `defineConfig`. */
export interface SimAPIConfig {
  /** Display name for the project. Shown in the Console and OpenAPI export. */
  name: string;

  /** Optional description for the project. Included in the OpenAPI export. */
  description?: string;

  /** Port the dev server listens on. Defaults to `3000`. */
  port?: number;

  /**
   * Directory (relative to the project root) that SimAPI scans for endpoint
   * files. Defaults to `"endpoints"`.
   */
  endpointsDir?: string;

  /**
   * Global auth handler applied to every `type: "secure"` endpoint.
   * Use `AuthHandlers` for common schemes or write your own.
   *
   * @example
   * import { AuthHandlers } from "@simapi/simapi";
   * authHandler: AuthHandlers.bearer()
   */
  authHandler?: AuthHandler;

  /**
   * Whether to persist request/response log entries to the database.
   * Defaults to `true`. Set to `false` to disable logging entirely.
   */
  logEntries?: boolean;

  /**
   * When `true`, logs `[SimAPI] METHOD /path → STATUS (Xms)` to stdout for
   * every request. Useful during development.
   */
  consoleLog?: boolean;

  /** Database connection for persisting request logs. */
  database?: DatabaseConfig;

  /**
   * When set, SimAPI automatically calls `throwValidationError(format)` before
   * every handler, so you don't need to call it manually.
   *
   * Set to `false` or `null` to disable (you must call `req.errors.throwValidationError()` yourself).
   *
   * @example
   * autoThrowValidationErrors: "laravel"
   */
  autoThrowValidationErrors?: ValidationFormat | false | null;
}

/**
 * Defines the SimAPI configuration for a project.
 * Pass the returned object as the default export from `simapi.config.ts`.
 *
 * @example
 * // simapi.config.ts
 * import { defineConfig } from "@simapi/simapi";
 *
 * export default defineConfig({
 *   name: "my-api",
 *   port: 3000,
 *   logEntries: true,
 *   database: { type: "sqlite", path: "./.simapi/db.sqlite" },
 * });
 */
export function defineConfig(config: SimAPIConfig): SimAPIConfig {
  return config;
}
