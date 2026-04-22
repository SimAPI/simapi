<p align="center">
  <img src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png" alt="SimAPI" width="160" style="display: block; border-radius: 10px;" />
</p>

<p align="center">
  Mock backends that behave like real ones.
</p>

<p align="center">
  <b><a href="https://simapi.mayrlabs.com">Documentation</a></b>
  |
  <b><a href="https://github.com/SimAPI/simapi">GitHub</a></b>
</p>

Build frontend features against real API behavior — before your backend exists. SimAPI lets you define endpoints as plain TypeScript objects, generate realistic fake data with faker-js, validate requests with Zod, and log everything to a database.

## Packages

| Package                               | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| [`@simapi/simapi`](packages/simapi)   | Core library — server, CLI, faker, validation    |
| [`@simapi/console`](packages/console) | Optional debug UI served at `/__simapi/console/` |

## Quickstart

```sh
npx @simapi/simapi@latest init my-api
cd my-api
npm run dev
```

Once running, use `npm run simapi` for the interactive CLI — setup deployments, manage the console, import/export OpenAPI specs.

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
