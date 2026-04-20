export class AppResponse {
  readonly status: number;
  readonly body: unknown;

  private constructor(status: number, body: unknown) {
    this.status = status;
    this.body = body;
  }

  static success(body?: unknown): AppResponse {
    return new AppResponse(200, body);
  }

  static created(body?: unknown): AppResponse {
    return new AppResponse(201, body);
  }

  static noContent(): AppResponse {
    return new AppResponse(204, null);
  }

  static unauthenticated(body?: unknown): AppResponse {
    return new AppResponse(401, body);
  }

  static unauthorised(body?: unknown): AppResponse {
    return new AppResponse(403, body);
  }

  static notFound(body?: unknown): AppResponse {
    return new AppResponse(404, body ?? { message: "Not found" });
  }

  static error(body?: unknown): AppResponse {
    return new AppResponse(500, body ?? { message: "Internal server error" });
  }

  static fail(probability: number): AppResponse | undefined {
    if (Math.random() < probability) {
      return new AppResponse(500, { message: "Simulated failure" });
    }
    return undefined;
  }

  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static array<T>(count: number, factory: () => T): T[] {
    return Array.from({ length: count }, () => factory());
  }
}
