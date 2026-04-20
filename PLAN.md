# SimAPI — Build Plan

## Wave 1 — Monorepo Tooling ✅

- [x] Remove Prettier
- [x] Install and configure Biome (lint + format)
- [x] Install Husky + lint-staged
- [x] Configure pre-commit hook (runs lint-staged on staged files)
- [x] Add `.simapi` to `.gitignore`

---

## Wave 2 — Core Types ✅

`packages/simapi` skeleton with the public API surface users write against.

- [x] Scaffold `packages/simapi` with `package.json`, `tsconfig.json`, `tsdown.config.ts`
- [x] `defineConfig()` — typed server config
- [x] `AppRequest` — wrapper with `.header()`, `.body()`, `.param()`, `.urlParam()`, `.validateBody()`
- [x] `AppResponse` — static methods: `.success()`, `.created()`, `.unauthenticated()`, `.unauthorised()`, `.error()`, `.fail()`, `.delay()`
- [x] `AppResponse.fake` — `.string()`, `.number()`, `.boolean()`, `.uuid()`, `.array()`
- [x] `Validator` — `.required()`, `.string()`, `.number()`, `.boolean()`, `.minLength()`, `.maxLength()`, `.email()`
- [x] `ValidationErrors` + `ValidationError` — `.hasError`, `.errorFields`, `.errorBag`, `.throwValidationError(format)`
- [x] `EndpointDefinition` type — typed endpoint shape
- [x] Type declarations + dual ESM/CJS build via tsdown

---

## Wave 3 — Dev Server ✅

Hono-based server that auto-discovers endpoints and runs the request lifecycle.

- [x] Hono + `@hono/node-server` setup (`src/server/startServer.ts`)
- [x] Endpoint auto-discovery from `endpoints/` directory (using `tsx/esm/api`)
- [x] Request lifecycle: match → auth → handler → response (+ global error handler)
- [x] `secure` vs `open` endpoint routing
- [x] Global auth handler invocation; 500 if endpoint is secure but handler not configured
- [x] JSON + form-urlencoded body parsing; query param + URL param extraction
- [x] Validation errors caught globally and formatted per `laravel` / `zod` convention
- [x] `simapi serve` command wired up (`bin/simapi.js` → `dist/cli.mjs`)

---

## Wave 4 — CLI ✅

All user-facing commands.

- [x] CLI entry via `cac` + `@clack/prompts`
- [x] `simapi init <name>` — scaffold new project (prompts: description, console, Dockerfile)
- [x] `simapi serve` — dev server with `tsx` live loading
- [x] `simapi build` — compile to `.simapi/dist/` via tsdown programmatic API
- [x] `simapi start` — run compiled bundle via `fork()`
- [x] `simapi endpoint:create` — interactive scaffold into `endpoints/`
- [x] `simapi console:add` / `simapi console:remove`
- [x] Project templates (inline template strings with `fill()` helper)

---

## Wave 5 — Database Layer ✅

Drizzle ORM with swappable adapters for request logging.

- [x] Drizzle schema for request log entries (`src/db/adapters/sqlite.ts`, `postgres.ts`)
- [x] SQLite adapter via `@libsql/client` (`file:` URL) — zero-config local default
- [x] libSQL adapter via `@libsql/client` (remote Turso URL + authToken)
- [x] Postgres adapter via `pg` + `drizzle-orm/node-postgres` — dynamically imported (code-split chunk)
- [x] `type: "none"` / no config — no-op adapter, zero overhead
- [x] `createAdapter(config, cwd)` factory in `src/db/index.ts`
- [x] `createApp()` accepts optional `DbAdapter`; logs all requests (including auth rejections and validation errors) via try/catch/finally
- [x] `logEntries: false` in config disables logging even when adapter is present
- [x] `serve.ts` initializes adapter, passes to `createApp`, closes on SIGINT/SIGTERM

---

## Wave 6 — Internal API ✅

`/__simapi/*` routes consumed by the console.

- [x] `GET /__simapi/health` — server metadata, version, endpoint count, logging flag
- [x] `GET /__simapi/endpoints` — list all registered endpoints (method, path, type)
- [x] `GET /__simapi/logs?limit=&offset=` — paginated request log (max 500 per page)
- [x] `GET /__simapi/logs/stream` — live SSE log feed with 30s heartbeat
- [x] `LogBus` (`src/server/logBus.ts`) — EventEmitter wrapping `DbAdapter`; emits `"entry"` on every logged request; SSE clients subscribe directly
- [x] Internal routes only registered when `LogBus` is present (dev server only; no-op if no bus)

---

## Wave 7 — Console (`@simapi/console`) ✅

Opt-in React SPA served at `localhost:3000/__simapi/console/`.

- [x] `packages/console` scaffolded with Vite + React 18 + TypeScript + Tailwind 3
- [x] `mount/index.ts` → `dist/index.mjs` (tsdown); `src/` → `dist/spa/` (Vite)
- [x] `mountConsole(app: Hono)` serves SPA assets from `dist/spa/` via Node.js `fs.readFile`; SPA fallback to `index.html` for unknown paths
- [x] Dynamic mount in `serve.ts`: `import("@simapi/console")` silently skips if not installed; marked `neverBundle` so it stays external in the CLI bundle
- [x] **Overview** tab — health/version/endpoint count from `/__simapi/health`
- [x] **Logs** tab — live SSE feed (`/__simapi/logs/stream`) + paginated history; filter, expand request/response bodies, export JSON
- [x] **Schema** tab — endpoint list with method/type badges; export OpenAPI 3 JSON (with path params + security schemes)
- [x] **Try** tab — select endpoint, fill path/query params and JSON body, fire request, display response
- [x] Root `biome.json` override: `noUnknownAtRules` off for CSS (suppresses `@tailwind` directives)

---

## Wave 8 — `create-simapi` + Docs ✅

- [x] `packages/create-simapi` — powers `npm create simapi@latest`
- [x] `apps/docs` — VitePress documentation site with guide + API reference pages
- [x] Railway deployment guide (canonical path); `PORT` env var support in `startServer.ts` and production entry
- [x] `examples/demo-project` — dogfooding project using both packages

---

## Stack Reference

| Concern               | Choice                                               |
| --------------------- | ---------------------------------------------------- |
| Runtime               | Node.js 20+                                          |
| Server                | Hono + `@hono/node-server`                           |
| TS loading (dev)      | `tsx`                                                |
| Database              | Drizzle + `better-sqlite3` / `@libsql/client` / `pg` |
| CLI                   | `cac` + `@clack/prompts`                             |
| Console UI            | Vite + React + Tailwind + shadcn/ui                  |
| Live logs             | Server-Sent Events                                   |
| Validation (internal) | Zod                                                  |
| Package build         | tsdown                                               |
| Testing               | Vitest                                               |
| Monorepo              | Turborepo + npm workspaces                           |
| Lint + Format         | Biome                                                |

<!--
AppResponse.fail(0.3)
await AppResponse.delay(1200)
 -->

<!-- Add models to servr -->
