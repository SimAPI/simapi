# EndpointDefinition

`EndpointDefinition` is the TypeScript interface for a SimAPI endpoint. Every named export from a file inside `endpoints/` that matches this shape is automatically registered.

```ts
import type { EndpointDefinition } from "@simapi/simapi";
```

## Interface

```ts
interface EndpointDefinition {
  path: string;
  method: HttpMethod;
  type: "open" | "secure";
  title?: string;
  description?: string;
  authHandler?: AuthHandler;
  validator?: z.ZodRawShape;
  failRate?: number;
  delay?: number;
  handler: (req: AppRequest) => AppResponse | Promise<AppResponse>;
}

type HttpMethod =
  | "GET" | "POST" | "PUT" | "PATCH"
  | "DELETE" | "HEAD" | "OPTIONS";
```

## Fields

### `path` — `string` *(required)*

The route pattern. Uses Hono's path syntax:

```ts
path: "/api/posts"           // exact
path: "/api/posts/:id"       // path parameter
path: "/api/users/:uid/posts/:pid"  // multiple params
```

### `method` — `HttpMethod` *(required)*

One of: `GET` `POST` `PUT` `PATCH` `DELETE` `HEAD` `OPTIONS`.

### `type` — `"open" | "secure"` *(required)*

- `"open"` — request passes directly to the handler.
- `"secure"` — `authHandler` runs first. If it returns an `AppResponse`, that response is sent and the handler is skipped.

### `title` — `string` *(optional)*

A short display name for the endpoint. Shown in the SimAPI Console schema view and included as `summary` in exported OpenAPI specs.

```ts
title: "Create Post",
```

### `description` — `string` *(optional)*

A longer description of what the endpoint does. Shown in the Console and as `description` in exported OpenAPI specs.

```ts
description: "Creates a new post and returns it with a generated ID.",
```

### `authHandler` — `AuthHandler` *(optional)*

An additional auth check that runs after the global `authHandler` (for `secure` endpoints) or standalone (for `open` endpoints). See the [Authentication guide](/guide/authentication) for full details.

```ts
authHandler: AuthHandlers.apiKey("x-api-key", "header"),

// or custom:
authHandler: (req) => {
  if (req.header("x-user-role") !== "admin")
    return AppResponse.unauthorised({ message: "Admin only." });
},
```

### `validator` — `z.ZodRawShape` *(optional)*

A flat Zod shape (not a `z.object()` — just the inner record). SimAPI wraps it automatically:

```ts
validator: {
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(["admin", "member"]).optional(),
},
```

Validated before the handler runs. Results are in `req.errors`.

### `failRate` — `number` *(optional)*

Probability (0–1) of returning `500 { message: "Simulated failure" }` **before** the handler runs. Set to `1` to always fail; `0` (or omit) to never fail.

```ts
failRate: 0.15,   // 15% of requests will 500
```

### `delay` — `number` *(optional)*

Milliseconds to wait before the handler runs. Applied after auth, before validation.

```ts
delay: 1200,   // simulates a slow database query
```

### `handler` — `(req: AppRequest) => AppResponse | Promise<AppResponse>` *(required)*

The function that produces the response. Receives an [`AppRequest`](/api/app-request) and must return an [`AppResponse`](/api/app-response).

```ts
handler: (req) => AppResponse.success({ data: makePost() }),
```

Async handlers are fully supported:

```ts
handler: async (req) => {
  const data = await fetchSomething();
  return AppResponse.success({ data });
},
```

## Execution order

For each incoming request:

1. Auth check (`type: "secure"` → run `authHandler`)
2. Artificial delay (`delay` ms)
3. Zod validation (`validator` → populate `req.errors`)
4. Auto-throw validation errors (if `autoThrowValidationErrors` is set in config)
5. Fail-rate check (`failRate` → maybe return 500)
6. Handler

## Example

```ts
import { z, AppResponse, faker, type EndpointDefinition } from "@simapi/simapi";
import { makePost } from "../models/post.js";

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",
  title: "Create Post",
  description: "Creates a new published post.",
  validator: {
    title: z.string().min(3),
    body:  z.string().min(10),
  },
  failRate: 0.05,
  delay: 200,
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({ data: makePost() });
  },
};
```
