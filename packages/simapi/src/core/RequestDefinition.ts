import type { ZodRawShape } from "zod";

/**
 * Defines the validation shape for an endpoint's incoming request.
 * Each field is an optional flat Zod shape validated before the handler runs.
 * Errors are merged into `req.errors` and keyed by field name.
 *
 * @example
 * // src/requests/createPost.ts
 * import { type RequestDefinition, z } from "@simapi/simapi";
 *
 * export const createPostRequest: RequestDefinition = {
 *   body: {
 *     title: z.string().min(3),
 *     body:  z.string().min(10),
 *   },
 *   query: {
 *     draft: z.string().optional(),
 *   },
 * };
 */
export interface RequestDefinition {
  /** Zod shape validated against the parsed request body (JSON or form data). */
  body?: ZodRawShape;

  /** Zod shape validated against query string parameters. */
  query?: ZodRawShape;

  /** Zod shape validated against request headers (lowercase keys). */
  headers?: ZodRawShape;

  /** Zod shape validated against form data (multipart or urlencoded). */
  form?: ZodRawShape;
}
