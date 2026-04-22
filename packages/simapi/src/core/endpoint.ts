import type { AppRequest } from "./AppRequest.js";
import type { AppResponse } from "./AppResponse.js";
import type { AuthHandler } from "./defineConfig.js";
import type { RequestDefinition } from "./RequestDefinition.js";

/** Supported HTTP methods for an endpoint. */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

/**
 * Defines a single API endpoint. Every named export from a file inside
 * `endpoints/` (or your configured `endpointsDir`) that matches this shape
 * is automatically registered by SimAPI.
 *
 * @example
 * export const listPosts: EndpointDefinition = {
 *   path: "/api/posts",
 *   method: "GET",
 *   type: "open",
 *   title: "List Posts",
 *   handler: () => AppResponse.success({ data: AppResponse.array(10, makePost) }),
 * };
 */
export interface EndpointDefinition {
  /** Route pattern using Hono syntax, e.g. `"/api/posts/:id"`. */
  path: string;

  /** HTTP method for this route. */
  method: HttpMethod;

  /**
   * Access control type.
   * - `"open"` — no auth check; handler runs immediately.
   * - `"secure"` — global `authHandler` from config runs first.
   */
  type: "open" | "secure";

  /**
   * Short display name shown in the SimAPI Console and used as `summary`
   * in exported OpenAPI specs.
   */
  title?: string;

  /**
   * Longer description shown in the SimAPI Console and as `description`
   * in exported OpenAPI specs.
   */
  description?: string;

  /**
   * Per-endpoint auth handler. Runs after the global `authHandler` for
   * `secure` endpoints, or standalone for `open` endpoints.
   *
   * @example
   * authHandler: AuthHandlers.apiKey("x-api-key", "header"),
   */
  authHandler?: AuthHandler;

  /**
   * Validation shapes for the incoming request. SimAPI validates each section
   * before the handler runs; results are merged into `req.errors`.
   *
   * @example
   * import { registerRequest } from "@/requests/register.js";
   * request: registerRequest,
   *
   * // or inline:
   * request: {
   *   body: {
   *     email:    z.string().email(),
   *     password: z.string().min(8),
   *   },
   *   query: {
   *     redirect: z.string().optional(),
   *   },
   * }
   */
  request?: RequestDefinition;

  /**
   * Probability (0–1) that SimAPI returns `500 { message: "Simulated failure" }`
   * before the handler runs. Useful for testing error states in your frontend.
   *
   * @example
   * failRate: 0.1  // 10% of requests will fail
   */
  failRate?: number;

  /**
   * Milliseconds to wait before the handler runs. Simulates network latency
   * or a slow database query.
   *
   * @example
   * delay: 800  // simulates an 800ms database query
   */
  delay?: number;

  /**
   * The function that produces the response. Receives an `AppRequest` and must
   * return an `AppResponse`. Async handlers are fully supported.
   *
   * @example
   * handler: (req) => AppResponse.success({ data: makePost() }),
   *
   * // Async:
   * handler: async (req) => {
   *   const data = await fetchSomething();
   *   return AppResponse.success({ data });
   * },
   */
  handler: (req: AppRequest) => AppResponse | Promise<AppResponse>;
}
