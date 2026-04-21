# @simapi/simapi

## 0.0.2

### Package rename & build fix

- Renamed package from `simapi` to `@simapi/simapi` — install with `npm install @simapi/simapi`
- Added `prepublishOnly` build step to ensure `dist/` is always included when publishing
- Fixed `ERR_MODULE_NOT_FOUND` error on `npx @simapi/simapi init` caused by missing `dist/cli.mjs` in the published package

## 0.0.1

### Initial release

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
