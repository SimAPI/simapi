# SimAPI

> Because hardcoding JSON lies to your frontend. SimAPI gives you a real backend behaviour — routing, auth, validation, and errors — before your backend exists.
>
> **Build frontend against reality, not assumptions.**

SimAPI is a local-first backend simulator that lets frontend and mobile developers build against real API behaviour before the backend exists.

## The problem

As a solo developer, I often build both the frontend and the backend of an app. The backend usually has to come first, which means spending weeks on an API before I have anything visible to show for the effort. The alternatives aren't great either:

- **Postman mock servers** are tedious to set up and boring to maintain, so I rarely use them.
- **Hardcoded fake responses** embedded in the app work, but they lie — no auth flow, no validation errors, no latency, no failure cases. And I have to rip them all out later.
- **Framework-specific solutions** (I once built a Dart package that simulates responses inside a Flutter app) don't port. If I switch to a JS stack, I have to rebuild the whole thing.

I want a plug-and-play mock server that behaves like a real backend — routing, auth, validation, errors, latency, flaky responses — that I can spin up in seconds and point any frontend at.

## The idea

SimAPI is distributed as an npm package. Users scaffold a new mock server with one command, add endpoints, and point their frontend at it. The server runs locally by default, can be deployed remotely, and has an optional debugging console for log inspection and API testing.

**One SimAPI project = one mock server.** If you're building three frontends, you spin up three SimAPI projects. Scaffolding is fast enough that there's no benefit to bundling multiple mock backends into one project.

The core insight: **users define their server in real TypeScript**, not JSON config. They get types, autocomplete, reusable helpers, and the full power of a programming language — while SimAPI handles all the plumbing.

## User experience

### Creating a project

```bash
npx simapi init hello-server
```

The CLI prompts:

```
? Description: Mock backend for the hello app
? Include the debugging console? (Y/n)
? Include a Dockerfile for deployment? (y/N)
```

Then:

```bash
cd hello-server
npm install
npm run serve
```

Project structure:

```
hello-server/
├── simapi.config.ts       # Server config — name, port, auth, logging, DB
├── endpoints/             # One file per endpoint or endpoint group
│   └── .gitkeep
├── authHandler.ts         # Global auth check (optional)
├── package.json
├── tsconfig.json
└── .gitignore
```

`package.json` scripts:

```json
{
  "scripts": {
    "serve": "simapi serve",
    "build": "simapi build",
    "start": "simapi start",
    "endpoint:create": "simapi endpoint:create"
  },
  "dependencies": {
    "simapi": "^0.1.0"
  }
}
```

If the user opted in, `@simapi/console` is also in dependencies.

### Adding endpoints

```bash
npm run endpoint:create
```

The CLI prompts for path, method, and auth type, then scaffolds a file in `endpoints/`. Endpoints are auto-discovered from the `endpoints/` directory at server start — no manual registration.

Users can also create endpoint files by hand; they're small enough that the CLI is a convenience, not a requirement.

### Using the server

Once running, the server is available at:

```
localhost:3000/{path}
```

No app ID prefix, no extra segments. A request to `localhost:3000/api/posts` hits the `/api/posts` endpoint directly. Frontend developers configure `http://localhost:3000` as their base URL — just like a real backend.

### Adding the console later

If a user skipped the console during `init`, they can add it anytime:

```bash
npx simapi console add
```

This installs `@simapi/console` and enables it. Removing it is equally simple:

```bash
npx simapi console remove
```

## The API

### Server config

```ts
// simapi.config.ts
import { defineConfig } from "simapi";
import { authHandler } from "./authHandler";

export default defineConfig({
  name: "Hello Server",
  description: "Mock backend for the hello app",
  port: 3000,
  authHandler,
  logEntries: true,

  database: {
    type: "sqlite",            // default — local file
    path: "./.simapi/db.sqlite",
  },
});
```

### Auth handler

```ts
// authHandler.ts
import { type AppRequest, AppResponse } from "simapi";

export function authHandler(req: AppRequest) {
  const bearerToken = req.header("Authorization");
  const username = req.body("username");
  const userId = req.param("userId");

  // Return a response to reject the request...
  if (!bearerToken) {
    return AppResponse.unauthenticated({ message: "Missing token" });
  }

  // ...or return nothing to let the request proceed.
}
```

Possible auth rejections:

- `AppResponse.unauthenticated(...)` — 401
- `AppResponse.unauthorised(...)` — 403
- `AppResponse.error(...)` — generic error

### Endpoints

Each file in `endpoints/` exports one or more endpoint definitions:

```ts
// endpoints/posts.ts
import { AppResponse, type AppRequest, Validator } from "simapi";

export const getPosts = {
  path: "/api/posts",
  method: "GET",
  type: "open", // 'open' | 'secure'
  handler: (req: AppRequest) => {
    return AppResponse.success({
      message: "Posts retrieved successfully",
      data: AppResponse.fake.array(10, {
        id: AppResponse.fake.number(),
        title: AppResponse.fake.string(),
        content: AppResponse.fake.string(),
      }),
    });
  },
};

export const getPost = {
  path: "/api/posts/:slug",
  method: "GET",
  type: "open",
  handler: (req: AppRequest) => {
    const slug = req.urlParam("slug");

    return AppResponse.success({
      message: "Post retrieved successfully",
      data: {
        id: AppResponse.fake.number(),
        slug,
        title: AppResponse.fake.string(),
        content: AppResponse.fake.string(),
      },
    });
  },
};
```

```ts
// endpoints/profile.ts
import { AppResponse, type AppRequest, Validator } from "simapi";

export const getProfile = {
  path: "/api/profile",
  method: "GET",
  type: "secure",
  handler: (req: AppRequest) => {
    return AppResponse.success({
      message: "Profile retrieved successfully",
      data: {
        id: AppResponse.fake.number(),
        name: AppResponse.fake.string(),
      },
    });
  },
};

export const updateProfile = {
  path: "/api/profile",
  method: "POST",
  type: "secure",
  handler: (req: AppRequest) => {
    const errors = req.validateBody({
      name: [Validator.required(), Validator.string()],
    });

    if (errors.hasError) {
      errors.throwValidationError("laravel"); // or 'zod', etc.
    }

    return AppResponse.created({
      message: "Profile updated successfully",
      data: {
        id: AppResponse.fake.number(),
        name: AppResponse.fake.string(),
      },
    });
  },
};
```

### Validation

`req.validateBody(...)` returns an errors object with:

- `errors.hasError` — boolean
- `errors.errorFields` — `string[]` of fields that failed
- `errors.errorBag` — `{ [field: string]: string[] }` of messages
- `errors.throwValidationError(format)` — throws a response formatted per the chosen framework convention (Laravel, Zod, etc.)

### Simulating real-world conditions

```ts
AppResponse.fail(0.3);     // 30% chance this handler returns a failure
AppResponse.delay(1200);   // add 1.2s of latency
```

These can be composed inside handlers to simulate flaky or slow endpoints.

## The request lifecycle

When a request hits `localhost:3000/{path}`, the server:

1. If `logEntries` is enabled, writes an initial log entry to the database (updated once the response is ready).
2. Matches the endpoint by path and method. Returns 404 if no match.
3. If the endpoint is `secure`, runs the `authHandler`. Short-circuits if it returns a response.
4. Runs the endpoint's handler.
5. Returns the response and updates the log entry with the result.

## The console (optional package)

The console is shipped as a separate package, `@simapi/console`. Users opt in during `init` or via `npx simapi console add`. If not installed, the server simply doesn't mount it — no errors, no config.

### How the opt-in works

At server startup, SimAPI attempts a dynamic import of `@simapi/console`. If it resolves, the console is mounted. If not, SimAPI skips it silently. This keeps the core package lean for users who don't want UI weight in their `node_modules`.

### What the console provides

Served at `localhost:3000/console`:

- **Overview** — server metadata, health, endpoint count
- **Logs** — live request log feed (via SSE), filterable and exportable
- **Schema** — Swagger-style API docs generated from endpoint definitions, exportable as OpenAPI 3
- **Try** — interactive request tester for calling endpoints directly from the UI

### How it talks to the core

The console is a React SPA. It calls an internal API exposed by the core at `/__simapi/*` (e.g. `/__simapi/endpoints`, `/__simapi/logs`, `/__simapi/logs/stream`). This is a versioned contract between the two packages — they ship in lockstep.

## Deployment

SimAPI is local-first but deploys anywhere Node runs. The workflow:

```bash
npm run build    # compiles endpoints and config into a production bundle
npm run start    # runs the compiled server — no TS compilation at runtime
```

`simapi build` bundles the user's TypeScript into `.simapi/dist/`. `simapi start` runs the bundle with plain Node — no `tsx`, no source loading, fast startup.

### Database options

Configured in `simapi.config.ts`:

```ts
database: {
  // Local SQLite — default, zero-config
  type: "sqlite",
  path: "./.simapi/db.sqlite",
}

// Or: Turso (libSQL) — SQLite-compatible, cloud-hosted, free tier
database: {
  type: "libsql",
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
}

// Or: Postgres — for teams with existing infrastructure
database: {
  type: "postgres",
  url: process.env.DATABASE_URL,
}

// Or: disable logging entirely
database: { type: "none" }
```

All three are backed by Drizzle with nearly identical query APIs, so swapping is a config change.

### Supported deploy targets

- **Railway / Render / Fly.io** — long-running Node processes. Default recommendation. `npm run build && npm run start` works as-is.
- **Docker** — a `Dockerfile` template is optionally included at `init`. Deploy anywhere that runs containers.
- **Vercel / Netlify / serverless** — not supported in v1. Possible later with adapter packages.

A one-page deployment guide will cover Railway end-to-end as the canonical path.

## Architecture

SimAPI is built as a Turborepo monorepo. Users never see any of this — they just install the packages they need.

### Repository layout

```
simapi/
├── apps/
│   └── docs/                     # Documentation site
│
├── packages/
│   ├── simapi/                   # Core — what users install by default
│   │   ├── src/
│   │   │   ├── cli/              # init, serve, build, start, endpoint:create,
│   │   │   │                     # console add/remove
│   │   │   ├── server/           # Hono setup, request lifecycle, dynamic console mount
│   │   │   ├── core/             # AppResponse, AppRequest, Validator, defineConfig
│   │   │   ├── db/               # Drizzle schema, adapters for sqlite/libsql/postgres
│   │   │   └── internal-api/     # /__simapi/* routes the console talks to
│   │   ├── templates/            # Scaffolded files for init and endpoint:create
│   │   ├── bin/simapi.js         # CLI entry
│   │   └── package.json
│   │
│   ├── console/                  # @simapi/console — opt-in debugging UI
│   │   ├── src/
│   │   │   ├── app/              # The React SPA (built with Vite)
│   │   │   └── index.ts          # Exports mountConsole(), bundles assets
│   │   ├── dist/                 # Build output: assets/ + index.js
│   │   └── package.json
│   │
│   └── create-simapi/            # Optional: powers `npm create simapi@latest`
│
├── examples/
│   └── demo-project/             # Dogfooding project using both packages
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Package boundaries

- **`simapi`** has no dependency on `@simapi/console`. It tries to dynamically import it at runtime; if missing, it skips the console.
- **`@simapi/console`** declares `simapi` as a peer dependency. Both packages ship in lockstep — a given `@simapi/console` version requires a matching `simapi` major version.
- They communicate only through the `/__simapi/*` internal API — a versioned contract.

### Build pipeline

Turborepo builds both packages in parallel with no ordering dependency:

- **`@simapi/console`** — Vite builds the React SPA to `dist/assets/`, tsup builds the `mountConsole` exporter to `dist/index.js` + `.d.ts`. Both published as one npm package.
- **`simapi`** — tsup builds CLI, server, and core to `dist/`. Dual ESM/CJS output, type declarations included.

### Stack

- **Runtime:** Node.js 20+
- **Server:** Hono + `@hono/node-server`
- **User-file TS loading:** `tsx` (dev only — production runs compiled JS)
- **Database:** `better-sqlite3` + Drizzle ORM (plus `@libsql/client` and `pg` for remote options)
- **CLI:** `cac` + `@clack/prompts`
- **Console UI:** Vite + React + TypeScript + Tailwind + shadcn/ui
- **Live logs:** Server-Sent Events
- **Validation (internal):** Zod
- **Package build:** tsup
- **Testing:** Vitest
- **Monorepo:** Turborepo + pnpm workspaces

## What makes it different

- **Not Postman** — code-first, not GUI-driven. Mock servers live in version control alongside the frontend they serve.
- **Not MSW** — framework-agnostic. Works with any HTTP client, any frontend stack, any mobile platform.
- **Not hardcoded fixtures** — real routing, real auth flow, real validation errors, real latency, real failure cases.
- **Not a static JSON server** — handlers are full TypeScript functions, so responses can be dynamic, stateful, or computed.
- **Not a heavy framework** — core package is lean. The UI is opt-in. Users take what they need.
