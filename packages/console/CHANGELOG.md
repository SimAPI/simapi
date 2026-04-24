# @simapi/console

## 0.0.10 - Version bump
 
- Bumped in sync with `@simapi/simapi` 0.0.10

## 0.0.9 - Version bump
 
- Bumped in sync with `@simapi/simapi` 0.0.9
 
 ## 0.0.8 - Persistence, Form Data & Defaults

- **Persistence**: Authentication presets and custom headers are now saved to `localStorage` — no more re-entering tokens or keys on refresh
- **Form Data**: Support for testing `multipart/form-data` and `application/x-www-form-urlencoded` endpoints via a new "Form" toggle in the Try-it panel
- **Default Values**: Testing inputs and documentation now automatically utilize `.default()` values defined in your Zod schemas
- **Header Persistence**: Custom headers defined in the testing panel are shared and persisted across all endpoints
- **UI Refinements**: Better spacing and layout in the endpoint detail panel

## 0.0.7 - Version bump

- Bumped in sync with `@simapi/simapi` 0.0.7

## 0.0.6 - Version bump

- Bumped in sync with `@simapi/simapi` 0.0.6

## 0.0.5 - Version bump

- Bumped in sync with `@simapi/simapi` 0.0.5

## 0.0.4 - Version bump

- Bumped in sync with `@simapi/simapi` 0.0.4

## 0.0.3 - Version bump

- Bumped in sync with `@simapi/simapi` 0.0.3

## 0.0.2 - Version bump

- Bumped in sync with `@simapi/simapi` 0.0.2

## 0.0.1 - Initial release

- Debug UI served at `/__simapi/console/` when installed alongside `simapi`
- **Overview** — server health, version, and endpoint count
- **Logs** — live SSE request stream with paginated history, filter, and JSON export
- **Schema** — endpoint list with method/type badges and OpenAPI 3 export
- **Try** — select an endpoint, fill params and body, fire the request interactively
- Automatically mounted when `simapi serve` detects the package is installed
