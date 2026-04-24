# @simapi/openapi

Robust OpenAPI 3.0/3.1 import and export utilities for the SimAPI ecosystem.

## Features

- **Bidirectional Sync**: Import a spec to generate endpoint stubs, or export your endpoints to generate a spec.
- **Full OAS 3.0 & 3.1 Support**: Import from and export to the latest OpenAPI specifications.
- **Smart Importer**:
  - Automatically groups endpoints into files based on OpenAPI **tags**.
  - Resolves complex **$ref** chains across components.
  - Generates typed TypeScript stubs with Zod validation.
  - Supports `const`, `enum`, `nullable` type arrays, and rich constraints.
- **Dynamic Exporter**: Generates a complete OpenAPI 3 spec from your SimAPI endpoints without coupling to the core library.
- **Smart Codegen**: Generates high-quality TypeScript code with Zod validation, including support for complex constraints and nullable types.

## Installation

This package is usually used via the `@simapi/simapi` CLI, but can be installed standalone:

```sh
npm install @simapi/openapi
```

## Usage

### Programmatic Import

```ts
import { runImportOpenAPI } from "@simapi/openapi";

await runImportOpenAPI("./openapi.yaml", process.cwd(), {
  output: "./src/endpoints",
});
```

### Programmatic Export

```ts
import { runExportOpenAPI } from "@simapi/openapi";

await runExportOpenAPI(process.cwd(), {
  output: "openapi.yaml",
  format: "yaml",
});
```

## License

MIT
