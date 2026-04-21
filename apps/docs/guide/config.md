# Configuration

## simapi.config.ts

Every SimAPI project needs a `simapi.config.ts` at the project root:

```ts
import { defineConfig } from "simapi";

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

## Options

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Project name (required) |
| `description` | `string` | `""` | Short description |
| `port` | `number` | `3000` | Port to listen on (overridden by `PORT` env var) |
| `endpointsDir` | `string` | `"./endpoints"` | Directory scanned for endpoint files |
| `logEntries` | `boolean` | `true` | Whether to write request logs to the database |
| `consoleLog` | `boolean` | `false` | Log each request to stdout: `[SimAPI] GET /api/posts → 200 (4ms)` |
| `autoThrowValidationErrors` | `"laravel" \| "zod" \| false` | `false` | Automatically throw a 422 when a `validator` fails, before the handler runs |
| `database` | `DatabaseConfig` | — | Where to store request logs |
| `authHandler` | `AuthHandler` | — | Called for every `secure` endpoint |

## Database adapters

### SQLite (default)

Zero-config. Database file is created automatically.

```ts
database: {
  type: "sqlite",
  path: "./.simapi/db.sqlite",
}
```

### libSQL / Turso

Connect to a Turso cloud database for team-shared logs:

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

Requires `pg` to be installed: `npm install pg`.

### None

Disable logging entirely:

```ts
database: { type: "none" }
```

## Auth handler

The auth handler runs before every `secure` endpoint. Return an `AppResponse` to reject the request, or return nothing to allow it:

```ts
// authHandler.ts
import { AppResponse, type AppRequest } from "simapi";

export function authHandler(req: AppRequest) {
  const token = req.header("Authorization");

  if (!token) {
    return AppResponse.unauthenticated({ message: "Missing token" });
  }

  // Returning nothing → request proceeds to handler
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
