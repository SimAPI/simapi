# @simapi/openapi

Robust OpenAPI 3.0/3.1 import and export utilities for the SimAPI ecosystem.

## Features

- **Bidirectional Sync**: Import a spec to generate endpoint stubs, or export your endpoints to generate a spec.
- **Smart Importer**: Decomposes specs into a structured architecture of endpoints, requests, and models.
- **Mock Data Factories**: Generates recursive `make{Model}` functions using `@faker-js/faker` for instant, realistic mock data.
- **Full OAS 3.0 & 3.1 Support**: Comprehensive support for complex schemas, `$ref` chains, and version-specific properties.
- **Typed Codegen**: Generates high-quality TypeScript code with Zod validation and strict type safety.

## Installation

```sh
npm install @simapi/openapi
```

## CLI Usage

You can use the CLI directly via `npx`:

```sh
# Import a spec to generate stubs, requests, and models
npx @simapi/openapi import openapi.yaml -o ./src

# Export your endpoints to an OpenAPI spec
npx @simapi/openapi export -o docs/api.yaml
```

| Command  | Description                                  |
| -------- | -------------------------------------------- |
| `import` | Generate code from an OpenAPI specification |
| `export` | Generate a specification from your endpoints |

## Output Structure

The importer generates a clean, modular structure:

```
src/
├── endpoints/   # Definitions and handlers wired with mock factories
├── requests/    # Zod shapes for body, query, and headers
└── models/      # TypeScript types, Zod schemas, and faker factories
```

## Programmatic API

### Import

```ts
import { runImportOpenAPI } from "@simapi/openapi";

await runImportOpenAPI("./openapi.yaml", process.cwd(), {
  output: "./src",
});
```

### Export

```ts
import { runExportOpenAPI } from "@simapi/openapi";

await runExportOpenAPI(process.cwd(), "openapi.yaml");
```

## License

MIT
