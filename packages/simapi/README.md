<h1 align="center" style="margin-bottom: 0px;">SimAPI</h1>
<h3 align="center" style="margin: -10px 0 30px 0;">@simapi/simapi</h3>

<p align="center">
  <img src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png" alt="SimAPI" width="160" style="display: block; border-radius: 10px;" />
</p>

<p align="center">
  Mock backends that behave like real ones.
</p>

<p align="center">
  <b><a href="https://simapi.mayrlabs.com">Documentation</a></b>
  |
  <b><a href="https://github.com/SimAPI/simapi">GitHub</a></b>
</p>

Build frontend features against real API behavior — before your backend exists. SimAPI lets you define endpoints as plain TypeScript objects, generate realistic fake data with faker-js, validate requests with Zod, and log everything to a database.

---

## Install

Scaffold a new project in one command:

```sh
npx @simapi/simapi@latest init my-api
cd my-api
npm run serve
```

Or add SimAPI to an existing project:

```sh
npm install @simapi/simapi
```

---

## Project structure

```
my-api/
├── src/
│   ├── endpoints/      # Every named export is auto-discovered — no registration
│   │   ├── posts.ts
│   │   └── users.ts
│   ├── models/         # Shared data factories
│   │   └── post.ts
│   └── requests/       # Optional — shared RequestDefinition objects
│       └── postRequest.ts
├── simapi.config.ts
└── package.json
```

---

## Defining endpoints

An endpoint is a plain TypeScript object. Export it and SimAPI discovers it automatically.

```ts
// src/endpoints/posts.ts
import { z, AppResponse, type EndpointDefinition } from "@simapi/simapi";
import { makePost } from "@/models/post.js";

export const listPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () => AppResponse.success({ data: AppResponse.array(10, makePost) }),
};

export const getPost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "GET",
  type: "open",
  handler: (req) => AppResponse.success({ data: makePost() }),
};

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",          // runs authHandler before the handler
  request: {
    body: {
      title: z.string().min(3),
      body:  z.string().min(10),
    },
  },
  handler: (req) => {
    req.errors.throwValidationError();   // throws 422 only when validation failed
    return AppResponse.created({ data: makePost() });
  },
};
```

### EndpointDefinition fields

| Field         | Required | Description                                                      |
| ------------- | -------- | ---------------------------------------------------------------- |
| `path`        | ✓        | Hono-style route pattern — `:param`, `/nested/path`              |
| `method`      | ✓        | `GET` `POST` `PUT` `PATCH` `DELETE` `HEAD` `OPTIONS`             |
| `type`        | ✓        | `"open"` (no auth) or `"secure"` (runs `authHandler` first)      |
| `handler`     | ✓        | `(req: AppRequest) => AppResponse`                               |
| `request`     |          | `RequestDefinition` — Zod shapes for `body`, `query`, `headers`  |
| `title`       |          | Display name — shown in Console and exported OpenAPI             |
| `description` |          | Longer description — same                                        |
| `authHandler` |          | Per-endpoint auth check (runs after global handler)              |
| `failRate`    |          | `0`–`1` probability of returning a simulated 500                 |
| `delay`       |          | Milliseconds to wait before the handler runs                     |

---

## Fake data

`faker` (powered by [faker-js](https://fakerjs.dev)) is re-exported directly from `@simapi/simapi`:

```ts
// models/post.ts
import { faker } from "@simapi/simapi";

export interface Post {
  id:        string;
  title:     string;
  body:      string;
  published: boolean;
  author:    string;
}

export function makePost(): Post {
  return {
    id:        faker.string.ulid(),
    title:     faker.lorem.sentence(),
    body:      faker.lorem.paragraphs(2),
    published: faker.datatype.boolean(),
    author:    faker.person.fullName(),
  };
}
```

Use `AppResponse.array(count, factory)` to generate a list where every item gets independently generated values:

```ts
handler: () => AppResponse.success({ data: AppResponse.array(10, makePost) }),
```

---

## Responses

All responses are created with static factory methods on `AppResponse`:

```ts
AppResponse.success({ data: { id: 1 } })         // 200
AppResponse.created({ data: { id: 42 } })        // 201
AppResponse.noContent()                          // 204
AppResponse.unauthenticated({ message: "..." })  // 401
AppResponse.unauthorised({ message: "..." })     // 403
AppResponse.notFound({ message: "..." })         // 404
AppResponse.error({ message: "..." })            // 500
```

---

## Validation

Add a `request` field with Zod shapes for `body`, `query`, and/or `headers`:

```ts
import { z } from "@simapi/simapi";

request: {
  body: {
    email:    z.string().email(),
    password: z.string().min(8),
    role:     z.enum(["admin", "member"]).optional(),
  },
  query: {
    page: z.coerce.number().int().min(1).optional(),
  },
},
handler: (req) => {
  req.errors.throwValidationError("laravel");  // throws 422 only when hasError is true
  return AppResponse.created({ data: {} });
},
```

`z` is re-exported directly from `@simapi/simapi` — no separate `zod` install needed.

Define shared `RequestDefinition` objects in `src/requests/` to reuse validation logic across endpoints:

```ts
// src/requests/postRequest.ts
import { z, type RequestDefinition } from "@simapi/simapi";

export const postRequest: RequestDefinition = {
  body: {
    title: z.string().min(3),
    body:  z.string().min(10),
  },
};
```

### Auto-throw

Set `autoThrowValidationErrors` in your config to skip the manual call entirely:

```ts
export default defineConfig({
  name: "my-api",
  autoThrowValidationErrors: "laravel",  // or "zod"
});
```

### Error formats

**Laravel** (`"laravel"`, default):
```json
{ "message": "The given data was invalid.", "errors": { "email": ["Invalid email"] } }
```

**Zod** (`"zod"`):
```json
{ "issues": [{ "path": ["email"], "message": "Invalid email" }] }
```

---

## Authentication

Set `authHandler` in your config to protect all `type: "secure"` endpoints. SimAPI ships ready-made factories for common schemes:

```ts
import { defineConfig, AuthHandlers } from "@simapi/simapi";

export default defineConfig({
  name: "my-api",
  authHandler: AuthHandlers.bearer(),   // requires Authorization: Bearer <token>
});
```

Built-in handlers: `bearer()`, `jwt()`, `basic()`, `apiKey(name, via)`, `cookie(name)`, `oauth2()`, `hmac()`, `digest()`.

Or write your own:

```ts
import { defineConfig, AppResponse, type AuthHandler } from "@simapi/simapi";

const authHandler: AuthHandler = (req) => {
  if (!req.header("Authorization"))
    return AppResponse.unauthenticated({ message: "Missing token" });
};

export default defineConfig({ name: "my-api", authHandler });
```

---

## Simulating failures and latency

```ts
export const getOrders: EndpointDefinition = {
  path: "/api/orders",
  method: "GET",
  type: "open",
  failRate: 0.1,   // 10% chance of a simulated 500
  delay: 300,      // 300ms artificial latency on every request
  handler: () => AppResponse.success({ data: [] }),
};
```

---

## Configuration

Create `simapi.config.ts` at your project root:

```ts
import { defineConfig } from "@simapi/simapi";

export default defineConfig({
  name: "my-api",
  port: 3000,
  endpointsDir: "./endpoints",
  consoleLog: false,
  autoThrowValidationErrors: "laravel",
  database: {
    type: "sqlite",
    path: "./.simapi/db.sqlite",
  },
});
```

### Database adapters

| Adapter          | Config                                                      |
| ---------------- | ----------------------------------------------------------- |
| SQLite (default) | `{ type: "sqlite", path: "./.simapi/db.sqlite" }`           |
| libSQL / Turso   | `{ type: "libsql", url: "libsql://...", authToken: "..." }` |
| Postgres         | `{ type: "postgres", url: process.env.DATABASE_URL }`       |
| None             | `{ type: "none" }`                                          |

---

## OpenAPI

**Import** — generate typed endpoint stubs from an existing spec:

```sh
simapi import openapi.yaml
simapi import openapi.json --output src/endpoints/
```

**Export** — produce an OpenAPI 3 spec from your endpoints:

```sh
simapi export
simapi export --output docs/api.yaml
simapi export --output api.json --format json
```

---

## Debug console

Install the optional browser UI to inspect live requests, browse your schema, and fire test requests:

```sh
npx simapi console:add
```

Then open **http://localhost:3000/__simapi/console/** while `simapi serve` is running.

See [`@simapi/console`](../console) for details.

---

## CLI reference

| Command                 | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `simapi serve`          | Start dev server with live TypeScript reload             |
| `simapi dev`            | Start dev server with file watching — auto-restarts      |
| `simapi build`          | Compile project to `.simapi/dist/server.mjs`             |
| `simapi start`          | Run the compiled production server                       |
| `simapi init [name]`    | Scaffold a new SimAPI project                            |
| `simapi interactive`    | Menu-driven CLI — setup, console, import/export          |
| `simapi import <spec>`  | Generate endpoint stubs from an OpenAPI spec             |
| `simapi export`         | Export endpoints as an OpenAPI 3 spec                    |
| `simapi setup <target>` | Generate config files (`docker`, `vercel`, `netlify`)    |
| `simapi console:add`    | Install `@simapi/console`                                |
| `simapi console:remove` | Uninstall `@simapi/console`                              |

---

## Contributing

`@simapi/simapi` is open source and contributions are welcome and appreciated — whether it's a bug report, a feature suggestion, a doc fix, or a pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, development workflow, code style, and how to submit a PR.

---

## License

[MIT](../../LICENSE)
