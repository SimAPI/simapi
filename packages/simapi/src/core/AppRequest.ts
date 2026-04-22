import { ValidationErrors } from "./ValidationErrors.js";

/**
 * Wraps an incoming HTTP request. An `AppRequest` instance is passed to every
 * endpoint handler and auth handler.
 */
export class AppRequest {
  /** Validation errors produced by the endpoint's `request` field. */
  readonly errors: ValidationErrors;

  constructor(
    private readonly _headers: Record<string, string>,
    private readonly _body: Record<string, unknown>,
    private readonly _queryParams: Record<string, string>,
    private readonly _urlParams: Record<string, string>,
    errors?: ValidationErrors
  ) {
    this.errors = errors ?? new ValidationErrors({});
  }

  /**
   * Returns the value of a request header (case-insensitive).
   *
   * @param name  Header name, e.g. `"authorization"` or `"content-type"`.
   * @returns The header value, or `undefined` if not present.
   *
   * @example
   * const token = req.header("authorization");
   */
  header(name: string): string | undefined {
    return this._headers[name] ?? this._headers[name.toLowerCase()];
  }

  /**
   * Returns a single field from the parsed request body, typed as `T`.
   *
   * @param field  Body field name.
   * @returns The field value cast to `T`, or `undefined` if not present.
   *
   * @example
   * const title = req.body<string>("title");
   * const age   = req.body<number>("age");
   */
  body<T = unknown>(field: string): T | undefined {
    return this._body[field] as T | undefined;
  }

  /**
   * Returns the entire parsed request body typed as `T`.
   *
   * @example
   * const payload = req.bodyAll<{ email: string; password: string }>();
   */
  bodyAll<T = Record<string, unknown>>(): T {
    return this._body as T;
  }

  /**
   * Returns the value of a query string parameter.
   *
   * @param name  Query parameter name.
   * @returns The string value, or `undefined` if not present.
   *
   * @example
   * const page  = Number(req.param("page")  ?? "1");
   * const limit = Number(req.param("limit") ?? "20");
   */
  param(name: string): string | undefined {
    return this._queryParams[name];
  }

  /**
   * Returns the value of a URL path parameter.
   * Path parameters are declared with `:name` in the route pattern.
   *
   * @param name  Parameter name without the leading colon.
   * @returns The string value, or `undefined` if not present.
   *
   * @example
   * // route: /api/posts/:id
   * const id = req.urlParam("id");
   */
  urlParam(name: string): string | undefined {
    return this._urlParams[name];
  }
}
