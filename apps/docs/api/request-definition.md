# RequestDefinition

A `RequestDefinition` defines the validation shape for an endpoint's incoming request. SimAPI uses these shapes to validate data before your handler runs.

## Structure

```ts
interface RequestDefinition {
  /** Zod shape validated against the JSON request body. */
  body?: ZodRawShape;

  /** Zod shape validated against form data (multipart or urlencoded). */
  form?: ZodRawShape;

  /** Zod shape validated against query string parameters. */
  query?: ZodRawShape;

  /** Zod shape validated against request headers (lowercase keys). */
  headers?: ZodRawShape;
}
```

## Example Usage

### Inline Definition

```ts
export const createUser: EndpointDefinition = {
  path: "/api/users",
  method: "POST",
  type: "open",
  request: {
    body: {
      email: z.string().email(),
      password: z.string().min(8),
    },
    query: {
      send_welcome: z.string().optional(),
    }
  },
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({ data: {} });
  }
};
```

### Shared Definitions

For reusability, define your requests in `src/requests/` and import them in your endpoints.

::: code-group

```ts [src/requests/auth.ts]
import { z, type RequestDefinition } from "@simapi/simapi";

export const loginRequest: RequestDefinition = {
  body: {
    email: z.string().email(),
    password: z.string().min(8),
  }
};
```

```ts [src/endpoints/auth.ts]
import { loginRequest } from "@/requests/auth.js";

export const login: EndpointDefinition = {
  request: loginRequest,
  // ...
};
```

:::


## Validation Process

1. SimAPI extracts data from the request based on the `Content-Type`.
2. Each section (`body`, `form`, `query`, `headers`) is validated against its corresponding Zod shape.
3. Validation errors are collected into `req.errors` (a [`ValidationErrors`](/api/validator) instance).
4. If `autoThrowValidationErrors` is enabled in config, SimAPI returns a 422 response immediately if any errors were found.
5. Otherwise, your handler runs, and you can check `req.errors.hasError` or call `req.errors.throwValidationError()`.

## Default Values

If you use `.default()` in your Zod schemas, those values will be populated in the SimAPI Console documentation and testing panel.

```ts
request: {
  body: {
    role: z.enum(["admin", "user"]).default("user"),
  }
}
```
