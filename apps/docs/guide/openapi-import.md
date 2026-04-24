# OpenAPI Import & Export

SimAPI can round-trip with OpenAPI 3 specs: import a spec to generate endpoint stubs, or export your endpoints to generate a spec.

## Import — generate stubs from a spec

If a backend spec already exists but the implementation is still in progress, `simapi import` generates typed endpoint stubs from it — `request.body` already wired from the request body schema.

```sh
simapi import openapi.yaml
simapi import openapi.json --output src/endpoints/
```

Both YAML and JSON specs are supported, including **OpenAPI 3.0.x** and **OpenAPI 3.1.x**.

| Option           | Default          | Description                        |
| ---------------- | ---------------- | ---------------------------------- |
| `--output`, `-o` | `src/endpoints/` | Directory to write generated files |

### What gets generated

SimAPI uses the **Tags** defined in your OpenAPI spec to group endpoints into logical files. For example, endpoints tagged with `Authentication` go into `authentication.ts`.

If no tags are present, SimAPI falls back to using the base path segment (e.g., `/api/posts/1` → `posts.ts`).

```
src/endpoints/
├── authentication.ts
├── posts.ts
└── users.ts
```

Each file contains typed, grouped stubs:

```ts
// src/endpoints/posts.ts  (generated)
import { z, AppResponse, type EndpointDefinition } from "@simapi/simapi";

export const listPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () => AppResponse.success({ data: {} }),
};

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "open",
  request: {
    body: {
      title: z.string(),
      body: z.string().min(10),
    },
  },
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({ data: {} });
  },
};
```

- Endpoints with `security` in the spec get `type: "secure"`.
- Request body schemas are converted to Zod `request.body` shapes automatically.
- `operationId` is used as the handler name when present, with automatic collision handling (e.g., `listPosts`, `listPosts1`).
- Support for complex Zod types: `const` (mapped to `z.literal`), `enum`, `nullable` type arrays, and rich constraints (`min`, `max`, `email`, `uuid`).
- Intelligent response mapping: 200/201/204 and even 3xx redirects are automatically mapped to the correct `AppResponse` patterns.

### Example spec

```yaml
openapi: "3.0.0"
info:
  title: My API
  version: "1.0.0"
paths:
  /api/posts:
    get:
      operationId: listPosts
    post:
      operationId: createPost
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title:
                  type: string
                  minLength: 3
                body:
                  type: string
```

```sh
simapi import openapi.yaml
# [SimAPI] Wrote src/endpoints/posts.ts
# [SimAPI] Import complete — 1 file(s) written to src/endpoints/
```

---

## Export — generate a spec from your endpoints

`simapi export` introspects your endpoint definitions (including Zod validators) and produces an OpenAPI 3 spec you can share with your team or feed into documentation tools.

```sh
npm run simapi   # → Export (interactive)
# or directly:
simapi export
simapi export --output docs/api.yaml
simapi export --output api.json --format json
```

| Option           | Default                                    | Description      |
| ---------------- | ------------------------------------------ | ---------------- |
| `--output`, `-o` | `openapi.yaml`                             | Output file path |
| `--format`       | `yaml` (or `json` if path ends in `.json`) | `yaml` or `json` |

### What gets generated

For each endpoint:
- Path parameters extracted from `:param` segments
- Request body schema derived from the `request.body` Zod shape (field types, min/max, formats)
- `security` added for `type: "secure"` endpoints
- Correct response status codes per HTTP method (200 GET, 201 POST, 204 DELETE)

```yaml
# openapi.yaml (generated)
openapi: 3.0.3
info:
  title: my-api
  version: 1.0.0
paths:
  /api/posts:
    get:
      responses:
        200:
          description: Success
    post:
      security:
        - {}
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title, body]
              properties:
                title:
                  type: string
                  minLength: 3
                body:
                  type: string
                  minLength: 10
      responses:
        201:
          description: Success
        422:
          description: Validation error
```

The generated spec is a solid starting point for API documentation, code-gen, or handoff to the real backend team.
