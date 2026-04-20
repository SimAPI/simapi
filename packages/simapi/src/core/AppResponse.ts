export class FakeDescriptor<T> {
  constructor(private readonly generator: () => T) {}

  resolve(): T {
    return this.generator();
  }
}

type ResolveFake<T> = T extends FakeDescriptor<infer V> ? V : T;
type ResolveTemplate<T> = { [K in keyof T]: ResolveFake<T[K]> };

const fake = {
  string(): FakeDescriptor<string> {
    return new FakeDescriptor(() => Math.random().toString(36).slice(2, 10));
  },

  number(): FakeDescriptor<number> {
    return new FakeDescriptor(() => Math.floor(Math.random() * 10000));
  },

  boolean(): FakeDescriptor<boolean> {
    return new FakeDescriptor(() => Math.random() > 0.5);
  },

  uuid(): FakeDescriptor<string> {
    return new FakeDescriptor(() =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
    );
  },

  array<T extends Record<string, unknown>>(
    count: number,
    template: () => T
  ): ResolveTemplate<T>[] {
    return Array.from({ length: count }, () => {
      const item: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(template())) {
        item[key] = value instanceof FakeDescriptor ? value.resolve() : value;
      }
      return item as ResolveTemplate<T>;
    });
  },
};

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

  static readonly fake = fake;
}
