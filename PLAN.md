# SimAPI — Build Plan

## Wave 1 — Monorepo Tooling ✅
- [x] Remove Prettier
- [x] Install and configure Biome (lint + format)
- [x] Install Husky + lint-staged
- [x] Configure pre-commit hook (runs lint-staged on staged files)
- [x] Add `.simapi` to `.gitignore`

---

## Wave 2 — Core Types (pending)
`packages/simapi` skeleton with the public API surface users write against.

- [ ] Scaffold `packages/simapi` with `package.json`, `tsconfig.json`, `tsup.config.ts`
- [ ] `defineConfig()` — typed server config
- [ ] `AppRequest` — wrapper with `.header()`, `.body()`, `.param()`, `.urlParam()`, `.validateBody()`
- [ ] `AppResponse` — static methods: `.success()`, `.created()`, `.unauthenticated()`, `.unauthorised()`, `.error()`, `.fail()`, `.delay()`
- [ ] `AppResponse.fake` — `.string()`, `.number()`, `.array()`
- [ ] `Validator` — `.required()`, `.string()` and the errors object shape
- [ ] Type declarations + dual ESM/CJS build via tsup

---

## Wave 3 — Dev Server (pending)
Hono-based server that auto-discovers endpoints and runs the request lifecycle.

- [ ] Hono + `@hono/node-server` setup
- [ ] Endpoint auto-discovery from `endpoints/` directory (using `tsx`)
- [ ] Request lifecycle: log → match → auth → handler → response
- [ ] `secure` vs `open` endpoint routing
- [ ] Global auth handler invocation
- [ ] `simapi serve` command wired up

---

## Wave 4 — CLI (pending)
All user-facing commands.

- [ ] CLI entry via `cac` + `@clack/prompts`
- [ ] `simapi init <name>` — scaffold new project (prompts: description, console, Dockerfile)
- [ ] `simapi serve` — dev server with `tsx` live loading
- [ ] `simapi build` — compile to `.simapi/dist/` via tsup
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
- [ ] `mountConsole()` exporter built with tsup alongside Vite SPA assets
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
| Package build | tsup |
| Testing | Vitest |
| Monorepo | Turborepo + npm workspaces |
| Lint + Format | Biome |
