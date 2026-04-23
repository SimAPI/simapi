# @simapi/simapi

## 0.0.9 - Better OpenAPI Import & Interactive CLI
 
- **Import:** Improved grouping logic — endpoints are now organized by their base path with camelCase normalization (e.g., `authVerification.ts`)
- **Import:** Intelligent naming — variables now prioritize OpenAPI summaries and operation IDs, falling back to `{method}{Path}` with automatic collision handling
- **Interactive:** Spec auto-discovery — `simapi interactive` now scans the current directory and lists potential OpenAPI files for quick selection
- **Docs:** Overhauled documentation — professional introduction, vision statement, and detailed comparison against alternatives
- **Fix:** Reliable process termination on SIGINT/SIGTERM, ensuring ports are always released
- **Fix:** Correctly handle `FormData` and `Blob` in `AppRequest` and production builds
 
## 0.0.8 - Console overhaul & validation improvements

- **Console:** Authenticated state and custom headers are now persisted to `localStorage` — no more re-entering tokens on refresh
- **Console:** Support for Form data (multipart/form-data and urlencoded) in the Try-it panel — switch between JSON and Form inputs
- **Console:** Schema documentation and test inputs now automatically utilize `default` values from Zod schemas
- **Validation:** Added `form` field to `RequestDefinition` — separate validation for form data from JSON body
- **Validation:** Added `validationErrorFormatter` to config — customize the response structure for 422 errors
- **Fix:** Server now terminates properly on SIGTERM/SIGINT, resolving issues where the dev server would move to a new port because the old one wasn't released
- **Docs:** Added [FAQ](/guide/faq) section and updated documentation for new features

## 0.0.7 - Request validation — body, query, and headers

- Added `RequestDefinition` interface — replaces the single `validator` field with separate `body`, `query`, and `headers` Zod shapes, enabling validation across all three input sources
- **Breaking:** `validator?: ZodRawShape` removed from `EndpointDefinition`; use `request: { body: { ... } }` instead
- Body, query string, and header validation errors are merged into a single `req.errors` bag — existing error-handling code (`throwValidationError`, `autoThrowValidationErrors`) works unchanged
- `RequestDefinition` is now exported from `@simapi/simapi` — define once in `src/requests/`, import in multiple endpoints for shared validation logic
- `simapi import` now generates `request: { body: { ... } }` stubs instead of `validator`
- Production build entry updated to collect validation errors from all three sources
- All examples, templates, and docs updated to use `request.body`

**Migration**

```ts
// before
validator: {
  email: z.string().email(),
  password: z.string().min(8),
},

// after
request: {
  body: {
    email: z.string().email(),
    password: z.string().min(8),
  },
},
```

Query and header validation:

```ts
request: {
  query: {
    page: z.coerce.number().int().min(1).optional(),
  },
  headers: {
    "x-api-key": z.string().min(1),
  },
},
```

## 0.0.6 - src directory structure, dev mode & interactive CLI

**Project structure**
- `simapi init` now scaffolds endpoints and models inside a `src/` directory: `src/endpoints/` and `src/models/`
- Auth handler is now scaffolded at `src/authHandler.ts`
- Generated `tsconfig.json` now includes `baseUrl` and `paths` configuration enabling `@/` imports (e.g. `import { makeUser } from "@/models/user.js"`)
- `simapi.config.ts` scaffolded with `endpointsDir: "src/endpoints"` explicitly set
- `simapi serve`, `simapi build`, and `simapi import` default `endpointsDir` updated to `"src/endpoints"`; `simapi build` looks for auth handler at `src/authHandler.ts`

**Dev mode**
- Added `simapi dev [cwd]` — watches `src/` and `simapi.config.ts` for changes and automatically restarts the server (debounced 300 ms)
- Scaffolded `package.json` now includes `"dev": "simapi dev"` script

**Interactive mode**
- Added `simapi interactive` — menu-driven CLI for common operations:
  - **Setup**: configure deployment platform (Docker, Vercel, Netlify)
  - **Console**: install or remove `@simapi/console`
  - **Import**: generate endpoint stubs from an OpenAPI spec (output defaults to `src/endpoints/`)
  - **Export**: export endpoints as OpenAPI YAML or JSON
- Scaffolded `package.json` includes `"simapi": "simapi interactive"` — run with `npm run simapi`
- Removed `import`, `export`, `setup:netlify`, `setup:vercel`, `console:add`, `console:remove` scripts from scaffolded `package.json`; all are accessible via `npm run simapi`

**Docker setup**
- `simapi setup docker` now generates a `Dockerfile` in the project root
- Available both via `simapi setup docker` directly and through `npm run simapi` → Setup → Docker

## 0.0.5 - Serverless deployment support (Vercel & Netlify)

- `simapi build` now auto-detects the target platform from CI environment variables (`VERCEL=1`, `NETLIFY=true`) and generates the correct output:
  - **Node.js** (default): `.simapi/dist/server.mjs` — long-running server, unchanged
  - **Vercel**: `api/index.mjs` — serverless handler using `@hono/node-server/vercel`
  - **Netlify**: `netlify/functions/api.mjs` — Netlify Functions handler using the Web Fetch API
- Added `--platform <node|vercel|netlify>` flag to `simapi build` for explicit local testing
- Added `simapi setup <platform>` command — generates `vercel.json` or `netlify.toml` in the project root
- Updated `.gitignore` template to exclude `/api/index.mjs` and `/netlify/functions/api.mjs` (serverless build artifacts)
- Added `NETLIFY_TOML` and `VERCEL_JSON` templates to the internal template library

## 0.0.4 - Starter scaffold & port fallback

- `simapi init` now scaffolds `endpoints/hello-world.ts` — a GET `/` (open) and POST `/` (secure) endpoint as a working example
- `simapi init` now scaffolds `models/user.ts` — a typed `User` interface with a `makeUser()` faker factory
- Fixed `EADDRINUSE` crash: the dev server now automatically retries on the next available port (up to 10 attempts) instead of throwing an unhandled error

## 0.0.3 - Bug fixes & init improvements

- Fixed all example files importing from `"simapi"` — now correctly import from `"@simapi/simapi"`
- Fixed scaffolded `simapi.config.ts`, `authHandler.ts`, and endpoint templates importing from `"simapi"` — updated to `"@simapi/simapi"`
- `simapi init` now installs `@simapi/simapi` (and `@simapi/console`) via `npm install` directly instead of pre-writing them into `package.json` — ensures the latest published version is always fetched from the registry

## 0.0.2 - Package rename & build fix

- Renamed package from `simapi` to `@simapi/simapi` — install with `npm install @simapi/simapi`
- Added `prepublishOnly` build step to ensure `dist/` is always included when publishing
- Fixed `ERR_MODULE_NOT_FOUND` error on `npx @simapi/simapi init` caused by missing `dist/cli.mjs` in the published package

## 0.0.1 - Initial release

**Core API**

- `AppResponse` — static factory methods: `success`, `created`, `noContent`, `unauthenticated`, `unauthorised`, `notFound`, `error`, `array`
- `AppRequest` — typed accessors: `header`, `body`, `bodyAll`, `param`, `urlParam`; populated `errors: ValidationErrors` field
- `ValidationErrors` — `hasError`, `errorFields`, `throwValidationError(format)` (throws only when errors exist)
- `ValidationError` — thrown by `throwValidationError`; caught and formatted as 422 by the server

**Zod validation**

- `validator?: z.ZodRawShape` field on `EndpointDefinition` — validated before the handler runs
- `req.errors` populated automatically; call `throwValidationError()` unconditionally
- `autoThrowValidationErrors: "laravel" | "zod"` config option to skip manual call

**Faker integration**

- `faker` re-exported from `@faker-js/faker` — full faker-js API available
- `z` re-exported from `zod`

**Endpoint simulation**

- `failRate?: number` on `EndpointDefinition` — probability (0–1) of returning a simulated 500
- `delay?: number` on `EndpointDefinition` — milliseconds to wait before the handler runs

**Configuration (`defineConfig`)**

- `endpointsDir` — directory to scan for endpoints (default: `"endpoints"`)
- `consoleLog` — log `[SimAPI] METHOD /path → STATUS (Xms)` to stdout per request
- `autoThrowValidationErrors` — global validation error format
- `authHandler`, `logEntries`, `database`, `port`, `name`, `description`

**CLI**

- `simapi serve` — dev server with live TypeScript loading via tsx
- `simapi build` — compile project to `.simapi/dist/server.mjs`
- `simapi start` — run the compiled server
- `simapi init` — interactive project scaffolder
- `simapi import <spec>` — generate typed endpoint stubs from an OpenAPI 3 YAML/JSON spec
- `simapi console:add` / `console:remove` — manage `@simapi/console`
