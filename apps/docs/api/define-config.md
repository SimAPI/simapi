# defineConfig

`defineConfig` is a typed helper that defines your server configuration. Import it in `simapi.config.ts`:

```ts
import { defineConfig } from "@simapi/simapi";

export default defineConfig({
  name: "my-api",
  description: "Mock backend for my app",
  port: 3000,
  endpointsDir: "./endpoints",
  logEntries: true,
  consoleLog: false,
  autoThrowValidationErrors: "laravel",
  database: {
    type: "sqlite",
    path: "./.simapi/db.sqlite",
  },
});
```

## SimAPIConfig options

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | *(required)* | Project name — shown in the console UI and exported spec |
| `description` | `string` | `""` | Short description |
| `port` | `number` | `3000` | Port to listen on (overridden by `PORT` env var) |
| `endpointsDir` | `string` | `"./endpoints"` | Directory scanned recursively for endpoint files |
| `logEntries` | `boolean` | `true` | Whether to write request logs to the database |
| `consoleLog` | `boolean` | `false` | Log each request to stdout: `[SimAPI] GET /api/posts → 200 (4ms)` |
| `autoThrowValidationErrors` | `"laravel" \| "zod" \| false \| null` | `false` | Automatically throw 422 before the handler when a `validator` fails |
| `database` | `DatabaseConfig` | `undefined` | Where to store request logs (see below) |
| `authHandler` | `AuthHandler` | `undefined` | Called before every `type: "secure"` endpoint |

## DatabaseConfig

### SQLite

```ts
database: {
  type: "sqlite",
  path: "./.simapi/db.sqlite",
}
```

### libSQL / Turso

```ts
database: {
  type: "libsql",
  url: "libsql://your-db.turso.io",
  authToken: process.env.TURSO_TOKEN!,
}
```

### Postgres

```ts
database: {
  type: "postgres",
  url: process.env.DATABASE_URL!,
}
```

### None

```ts
database: { type: "none" }
```

## AuthHandler

Runs before every `type: "secure"` endpoint. Return an `AppResponse` to reject the request, or return nothing to allow it:

```ts
import { AppResponse, type AppRequest } from "@simapi/simapi";

export function authHandler(req: AppRequest) {
  const token = req.header("Authorization");

  if (!token) {
    return AppResponse.unauthenticated({ message: "Missing token" });
  }

  // returning undefined → request proceeds to the endpoint handler
}
```

Wire it up in your config:

```ts
import { authHandler } from "./authHandler.js";

export default defineConfig({
  name: "my-api",
  authHandler,
});
```
