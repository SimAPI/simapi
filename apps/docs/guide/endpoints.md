# Defining Endpoints

## Endpoint shape

An endpoint is a plain TypeScript object. All fields:

```ts
import { z, AppResponse, type AppRequest, type EndpointDefinition } from "@simapi/simapi";

export const myEndpoint: EndpointDefinition = {
  path: "/api/posts/:id",   // Hono-style route — :param, /nested/path
  method: "GET",             // GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS
  type: "open",              // "open" = no auth | "secure" = runs authHandler first

  // Optional — shown in the Console schema view and OpenAPI export
  title: "Get Post",
  description: "Returns a single post by ID.",

  // Optional — Zod shapes validated before handler runs
  request: {
    body: {
      title: z.string().min(3),
    },
  },

  // Optional — probability (0–1) of returning 500 before handler runs
  failRate: 0.1,

  // Optional — milliseconds to wait before handler runs
  delay: 300,

  handler: (req: AppRequest) => AppResponse.success({ data: {} }),
};
```

SimAPI discovers every named export from every `.ts` file inside `src/endpoints/` (or your configured `endpointsDir`). No registration needed.

## Grouping endpoints

Multiple endpoints can live in one file — group by resource:

```ts
// src/endpoints/posts.ts
import { AppResponse, type EndpointDefinition } from "@simapi/simapi";
import { makePost } from "@/models/post.js";

export const listPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () => AppResponse.success({ data: AppResponse.array(10, makePost) }),
};

export const getPost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "GET",
  type: "open",
  handler: () => AppResponse.success({ data: makePost() }),
};

export const deletePost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "DELETE",
  type: "secure",
  handler: () => AppResponse.noContent(),
};
```

## Models

Define data factories in `src/models/` and import them across endpoints using the `@/` alias:

::: code-group

```ts [src/models/post.ts]
import { faker } from "@simapi/simapi";

export interface Post {
  id: string;
  title: string;
  body: string;
  published: boolean;
}

export function makePost(): Post {
  return {
    id: faker.string.ulid(),
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    published: faker.datatype.boolean(),
  };
}
```

```ts [src/endpoints/posts.ts]
import { makePost } from "@/models/post.js";

handler: () => AppResponse.success({ data: AppResponse.array(5, makePost) }),
```

:::

## Path parameters

Use `:param` syntax — retrieved with `req.urlParam`:

```ts
export const getPost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "GET",
  type: "open",
  handler: (req) => {
    const id = req.urlParam("id"); // [!code focus]
    return AppResponse.success({ data: { id } });
  },
};
```

## Query parameters

```ts
const page  = Number(req.param("page")  ?? "1");
const limit = Number(req.param("limit") ?? "20");
```

## Request body

```ts
const title = req.body<string>("title");
const age   = req.body<number>("age");

// or the full object:
const all = req.bodyAll<{ title: string; age: number }>();

// Form data (multipart or urlencoded):
const name = req.form<string>("name");
const data = req.formAll();
```

## Validation with Zod

Add a `request` field — SimAPI validates `body`, `query`, and/or `headers` before your handler runs and populates `req.errors`:

```ts
import { z, AppResponse, type AppRequest, type EndpointDefinition } from "@simapi/simapi";

export const createUser: EndpointDefinition = { // [!code focus]
  path: "/api/users",
  method: "POST",
  type: "open",
  request: { // [!code focus]
    body: { // [!code focus]
      email:    z.string().email(), // [!code focus]
      password: z.string().min(8), // [!code focus]
      age:      z.number().int().min(18).optional(), // [!code focus]
    }, // [!code focus]
    form: { // multipart/form-data or urlencoded // [!code focus]
      avatar: z.string().url().optional(), // [!code focus]
    }, // [!code focus]
    query: { // query string parameters // [!code focus]
      source: z.string().optional(), // [!code focus]
    }, // [!code focus]
    headers: { // request headers (lowercase keys) // [!code focus]
      "x-client-id": z.string().uuid(), // [!code focus]
    }, // [!code focus]
  }, // [!code focus]
  handler: (req: AppRequest) => {
    // throws 422 only when hasError is true — unconditional call is safe
    req.errors.throwValidationError("laravel");
    return AppResponse.created({ data: { id: 1 } });
  },
}; // [!code focus]
```

### Auto-throw

Skip the manual call by setting `autoThrowValidationErrors` in your config:

```ts
export default defineConfig({
  name: "my-api",
  autoThrowValidationErrors: "laravel", // or "zod" // [!code focus]
});
```

### Error format — Laravel

```json
{
  "message": "The given data was invalid.",
  "errors": { "email": ["Invalid email"] }
}
```

### Error format — Zod

```json
{
  "issues": [{ "path": ["email"], "message": "Invalid email" }]
}
```

## Fake data

Import `faker` (powered by faker-js) and `AppResponse.array` for realistic responses:

```ts
import {
  faker,  // [!code focus]
  AppResponse,
  type EndpointDefinition
} from "@simapi/simapi"; // [!code focus]

export const getPosts: EndpointDefinition = { // [!code focus]
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () =>
    AppResponse.success({
      data: AppResponse.array(5, () => ({ // [!code focus]
        id:        faker.string.ulid(), // [!code focus]
        title:     faker.lorem.sentence(), // [!code focus]
        body:      faker.lorem.paragraph(), // [!code focus]
        published: faker.datatype.boolean(), // [!code focus]
        author:    faker.person.fullName(), // [!code focus]
      })), // [!code focus]
      meta: { total: 5, page: 1, perPage: 20 },
    }),
}; // [!code focus]
```

`AppResponse.array(count, factory)` calls `factory` once per item — every element gets unique values.

## Simulating failures and latency

Set `failRate` and `delay` on the endpoint — SimAPI handles them before your handler runs:

```ts
export const getInventory: EndpointDefinition = { // [!code focus]
  path: "/api/inventory",
  method: "GET",
  type: "open",
  failRate: 0.2,   // 20% chance of 500 { message: "Simulated failure" } // [!code focus]
  delay: 800,      // always wait 800ms before responding // [!code focus]
  handler: () => AppResponse.success({ data: [] }),
}; // [!code focus]
```

Both fields are applied transparently — your handler code stays clean.

## Secure endpoints

Set `type: "secure"` and SimAPI runs your `authHandler` before the handler:

```ts
export const deletePost: EndpointDefinition = { // [!code focus]
  path: "/api/posts/:id",
  method: "DELETE",
  type: "secure", // [!code focus]
  handler: () => AppResponse.noContent(),
}; // [!code focus]
```

See [Configuration](/guide/config) for how to set up `authHandler`.
