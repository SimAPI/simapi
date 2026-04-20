# SimAPI

> Mock backends that behave like real ones.

Build frontend features against real API behavior — before your backend exists. SimAPI lets you define endpoints as plain TypeScript objects, generate realistic fake data with faker-js, validate requests with Zod, and log everything to a database.

## Packages

| Package | Description |
|---|---|
| [`simapi`](packages/simapi) | Core library — server, CLI, faker, validation |
| [`@simapi/console`](packages/console) | Optional debug UI served at `/__simapi/console/` |
| [`create-simapi`](packages/create-simapi) | Scaffold a new project via `npm create simapi@latest` |

## Quickstart

```sh
npm create simapi@latest my-api
cd my-api
npm run serve
```

## Development

```sh
# Install all dependencies
npm install

# Build all packages
npm run build

# Type-check all packages
npm run check-types
```

## License

[MIT](LICENSE)
