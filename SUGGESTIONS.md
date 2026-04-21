# SimAPI — Improvement Suggestions

## 1. Stateful mock models

Right now every request gets fresh fake data. A "model" layer would let endpoints share in-memory state across requests — create a post, read it back, delete it:

```ts
import { defineModel } from "simapi";
const posts = defineModel("posts", { id: z.string(), title: z.string() });

// POST /api/posts → posts.create(body)
// GET  /api/posts → posts.all()
// GET  /api/posts/:id → posts.find(id)
// DELETE /api/posts/:id → posts.delete(id)
```

The model would be reset on server restart and optionally seeded from a factory.

## 2. Scenario switching

Allow switching between pre-configured response "scenarios" at runtime — useful for testing error states without changing code:

```ts
// In the console, switch to the "auth-failure" scenario
// All matching endpoints return their scenario handler instead
defineScenario("auth-failure", {
  "GET /api/users": () => AppResponse.unauthenticated(),
});
```

An HTTP endpoint like `POST /__simapi/scenario` could drive this from tests or the console.

## 3. Response seeding from real API fixtures

Let developers capture real API responses into fixture files and replay them:

```sh
simapi capture --url https://api.example.com/posts --output fixtures/posts.json
```

An endpoint then serves the fixture instead of generated data, giving truly realistic payloads.

## 4. Type-safe path params in handlers

Currently `req.urlParam("id")` returns `string | undefined`. With the path pattern available at definition time, TypeScript could infer the param names:

```ts
// Inferred: urlParam accepts "id" | "slug" for path "/api/:id/:slug"
export const getPost: EndpointDefinition<"/api/:id/:slug"> = { ... };
```

This would catch `req.urlParam("typo")` at compile time.

## 5. Request/response interceptors

Plugin-style hooks that run on every request, useful for things like CORS headers, rate limiting simulation, or global auth token injection:

```ts
export default defineConfig({
  name: "my-api",
  interceptors: [
    corsInterceptor({ origin: "*" }),
    rateLimitInterceptor({ max: 60, window: "1m", mode: "simulate" }),
  ],
});
```

## 6. OpenAPI import — generate endpoints from a spec

Go the other direction: given an OpenAPI 3 spec, generate endpoint stubs with validators already wired:

```sh
simapi import openapi.yaml --output endpoints/
```

This would dramatically speed up adoption when a backend spec already exists but the implementation is in progress.

## 7. Seeded determinism

A `seed` config option to make faker output deterministic — useful for snapshot testing where you need stable fake data across runs:

```ts
export default defineConfig({
  name: "my-api",
  faker: { seed: 42 },
});
```

## 8. Middleware support

Let users add custom Hono middleware (e.g. for request logging, auth injection, CORS) without forking the server:

```ts
export default defineConfig({
  name: "my-api",
  middleware: [
    async (c, next) => {
      c.header("X-Response-Time", String(Date.now()));
      await next();
    },
  ],
});
```

## 9. CLI `simapi mock <url>` — zero-config proxy mode

Point SimAPI at a real API URL; it proxies requests and records them as fixtures automatically. Future requests are served from the fixture cache. Good for teams where the backend exists but is unreliable during development.

## 10. VS Code extension

A companion VS Code extension to:
- Show a request-log panel in the sidebar (no browser needed)
- Jump to the endpoint definition from a log entry
- Quickly scaffold an endpoint for a selected URL
