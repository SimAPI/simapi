# OpenAPI Import

If a backend spec already exists but the implementation is still in progress, `simapi import` generates typed endpoint stubs directly from it — validators already wired, ready to fill in.

## Usage

```sh
simapi import openapi.yaml
simapi import openapi.json --output endpoints/
```

Both YAML and JSON OpenAPI 3 specs are supported.

| Option | Default | Description |
|---|---|---|
| `--output`, `-o` | `endpoints/` | Directory to write generated files |

## What gets generated

Given a spec with `/api/posts` and `/api/users`, SimAPI creates:

```
endpoints/
├── posts.ts
└── users.ts
```

Each file contains typed, grouped endpoint stubs:

```ts
// endpoints/posts.ts  (generated)
import { z, AppResponse, type EndpointDefinition } from "simapi";

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
  validator: {
    title: z.string(),
    body: z.string().min(10),
  },
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({ data: {} });
  },
};
```

- Endpoints marked with `security` in the spec get `type: "secure"`.
- Request body schemas are converted to Zod validators automatically.
- `operationId` is used as the export name when present.

## Example spec

```yaml
# openapi.yaml
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
# [SimAPI] Wrote endpoints/posts.ts
# [SimAPI] Import complete — 1 file(s) written to endpoints/
```

After import, run `simapi serve` to start serving the generated stubs immediately. Fill in the handlers as the real backend takes shape.
