<img src="simapi.png" alt="SimAPI" width="120" style="display: block; margin: 10px auto; border-radius: 10px;" />

> Mock backends that behave like real ones.

**[Documentation](https://simapi.mayrlabs.com)** | **[Quickstart](#quickstart)** | **[GitHub](https://github.com/SimAPI/simapi)**

Build frontend features against real API behavior — before your backend exists. SimAPI lets you define endpoints as plain TypeScript objects, generate realistic fake data with faker-js, validate requests with Zod, and log everything to a database.

## Packages

| Package                               | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| [`simapi`](packages/simapi)           | Core library — server, CLI, faker, validation    |
| [`@simapi/console`](packages/console) | Optional debug UI served at `/__simapi/console/` |

## Quickstart

```sh
npx simapi init my-api
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
