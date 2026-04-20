# @simapi/console

<img src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png" alt="SimAPI" width="120" style="display: block; margin: 10px auto; border-radius: 10px;" />

> Mock backends that behave like real ones.

Optional debug UI for [SimAPI](../simapi) — inspect live requests, browse your endpoint schema, and fire test requests interactively.

## Install

```sh
npx simapi console:add
```

Or manually:

```sh
npm install @simapi/console
```

## Usage

The console is automatically mounted when `@simapi/console` is installed and you run `simapi serve`.

Browse to `http://localhost:3000/__simapi/console/` to open it.

## Features

- **Overview** — server health, version, endpoint count
- **Logs** — live SSE request stream + paginated history with filter and JSON export
- **Schema** — endpoint list with method/type badges; OpenAPI 3 export
- **Try** — select an endpoint, fill params and body, fire the request

## License

[MIT](../../LICENSE)
