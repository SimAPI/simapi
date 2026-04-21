# @simapi/console

## 0.0.3

### Version bump

- Bumped in sync with `@simapi/simapi` 0.0.3

## 0.0.2

### Version bump

- Bumped in sync with `@simapi/simapi` 0.0.2

## 0.0.1

### Initial release

- Debug UI served at `/__simapi/console/` when installed alongside `simapi`
- **Overview** — server health, version, and endpoint count
- **Logs** — live SSE request stream with paginated history, filter, and JSON export
- **Schema** — endpoint list with method/type badges and OpenAPI 3 export
- **Try** — select an endpoint, fill params and body, fire the request interactively
- Automatically mounted when `simapi serve` detects the package is installed
