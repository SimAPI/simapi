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

## Wave 4 — CLI (pending)
All user-facing commands.

- [ ] CLI entry via `cac` + `@clack/prompts`
- [ ] `simapi init <name>` — scaffold new project (prompts: description, console, Dockerfile)
- [ ] `simapi serve` — dev server with `tsx` live loading
- [ ] `simapi build` — compile to `.simapi/dist/` via tsdown
- [ ] `simapi start` — run compiled bundle
- [ ] `simapi endpoint:create` — interactive scaffold into `endpoints/`
- [ ] `simapi console add` / `simapi console remove`
- [ ] Project templates (scaffold files for `init` and `endpoint:create`)

---

## Wave 5 — Database Layer (pending)
Drizzle ORM with swappable adapters for request logging.

- [ ] Drizzle schema for request log entries
- [ ] SQLite adapter (`better-sqlite3`) — default, zero-config
- [ ] libSQL adapter (`@libsql/client`) — Turso cloud target
- [ ] Postgres adapter (`pg`) — team infrastructure target
- [ ] `type: "none"` — disables logging entirely
- [ ] Adapter selection driven by `simapi.config.ts`

---

## Wave 6 — Internal API (pending)
`/__simapi/*` routes consumed by the console.

- [ ] `GET /__simapi/endpoints` — list all registered endpoints
- [ ] `GET /__simapi/logs` — paginated request log
- [ ] `GET /__simapi/logs/stream` — live log feed via SSE
- [ ] Versioned contract between core and console

---

## Wave 7 — Console (`@simapi/console`) (pending)
Opt-in React SPA served at `localhost:3000/console`.

- [ ] Scaffold `packages/console` with Vite + React + TypeScript + Tailwind + shadcn/ui
- [ ] Dynamic mount: core attempts `import('@simapi/console')` at startup; skips silently if missing
- [ ] `mountConsole()` exporter built with tsdown alongside Vite SPA assets
- [ ] **Overview** tab — server metadata, health, endpoint count
- [ ] **Logs** tab — live SSE feed, filterable, exportable
- [ ] **Schema** tab — Swagger-style docs from endpoint definitions, exportable as OpenAPI 3
- [ ] **Try** tab — interactive request tester

---

## Wave 8 — `create-simapi` + Docs (pending)
- [ ] `packages/create-simapi` — powers `npm create simapi@latest`
- [ ] `apps/docs` — documentation site
- [ ] Railway deployment guide (canonical path)
- [ ] `examples/demo-project` — dogfooding project using both packages

---

## Stack Reference

| Concern | Choice |
|---|---|
| Runtime | Node.js 20+ |
| Server | Hono + `@hono/node-server` |
| TS loading (dev) | `tsx` |
| Database | Drizzle + `better-sqlite3` / `@libsql/client` / `pg` |
| CLI | `cac` + `@clack/prompts` |
| Console UI | Vite + React + Tailwind + shadcn/ui |
| Live logs | Server-Sent Events |
| Validation (internal) | Zod |
| Package build | tsdown |
| Testing | Vitest |
| Monorepo | Turborepo + npm workspaces |
| Lint + Format | Biome |
