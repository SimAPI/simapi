/**
 * Represents an HTTP response returned by an endpoint or auth handler.
 * Create instances exclusively through the static factory methods.
 */
export class AppResponse {
  /** The HTTP status code. */
  readonly status: number;
  /** The response body, serialised as JSON. */
  readonly body: unknown;

  private constructor(status: number, body: unknown) {
    this.status = status;
    this.body = body;
  }

  /**
   * `200 OK` — request succeeded.
   *
   * @example
   * return AppResponse.success({ data: makePost() });
   */
  static success(body?: unknown): AppResponse {
    return new AppResponse(200, body);
  }

  /**
   * `201 Created` — resource was created successfully.
   *
   * @example
   * return AppResponse.created({ data: { id: "new-id", ...fields } });
   */
  static created(body?: unknown): AppResponse {
    return new AppResponse(201, body);
  }

  /**
   * `204 No Content` — request succeeded with no response body.
   * Typically used for DELETE endpoints.
   *
   * @example
   * return AppResponse.noContent();
   */
  static noContent(): AppResponse {
    return new AppResponse(204, null);
  }

  /**
   * `401 Unauthorized` — the request lacks valid authentication credentials.
   *
   * @example
   * return AppResponse.unauthenticated({ message: "Missing Authorization header" });
   */
  static unauthenticated(body?: unknown): AppResponse {
    return new AppResponse(401, body);
  }

  /**
   * `403 Forbidden` — the caller is authenticated but lacks permission.
   *
   * @example
   * return AppResponse.unauthorised({ message: "Admin access required" });
   */
  static unauthorised(body?: unknown): AppResponse {
    return new AppResponse(403, body);
  }

  /**
   * `404 Not Found` — the requested resource does not exist.
   * Defaults to `{ message: "Not found" }` if no body is provided.
   *
   * @example
   * return AppResponse.notFound({ message: "Post not found" });
   */
  static notFound(body?: unknown): AppResponse {
    return new AppResponse(404, body ?? { message: "Not found" });
  }

  /**
   * `500 Internal Server Error` — something went wrong on the server.
   * Defaults to `{ message: "Internal server error" }` if no body is provided.
   *
   * @example
   * return AppResponse.error({ message: "Database unavailable" });
   */
  static error(body?: unknown): AppResponse {
    return new AppResponse(500, body ?? { message: "Internal server error" });
  }

  /**
   * `301 | 302 | 307 | 308` — redirect the client to `url`.
   * The body carries `{ location }` so the server layer can emit a proper
   * `Location` header and the correct 3xx status.
   *
   * @example
   * return AppResponse.redirect("/dashboard");
   * return AppResponse.redirect("https://example.com/new-path", 301);
   */
  static redirect(
    url: string,
    status: 301 | 302 | 307 | 308 = 302
  ): AppResponse {
    return new AppResponse(status, { location: url });
  }

  /**
   * Generates an array of `count` items by calling `factory` once per element.
   * Each call produces independent faker data.
   *
   * @param count    Number of items to generate.
   * @param factory  Zero-argument factory function returning one item.
   *
   * @example
   * AppResponse.array(10, makePost)
   * // → [{ id: "...", title: "..." }, ...] (10 unique posts)
   */
  static array<T>(count: number, factory: () => T): T[] {
    return Array.from({ length: count }, () => factory());
  }

  /**
   * Returns `true` when `val` is an `AppResponse`.
   *
   * Use this instead of `instanceof AppResponse` anywhere the check must work
   * across separate bundle copies of the package (e.g. inside the CLI bundle
   * when user code imports `AppResponse` from the library bundle).
   */
  static isAppResponse(val: unknown): val is AppResponse {
    return (
      val !== null &&
      val !== undefined &&
      typeof val === "object" &&
      typeof (val as { status?: unknown }).status === "number" &&
      "body" in (val as object)
    );
  }
}
