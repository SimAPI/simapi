# Defining Endpoints

## Endpoint shape

An endpoint is a plain TypeScript object exported from any file inside `endpoints/`:

```ts
import { AppResponse, type AppRequest, type EndpointDefinition } from "simapi";

export const myEndpoint: EndpointDefinition = {
  path: "/api/resource",    // Hono-style route pattern
  method: "GET",            // GET | POST | PUT | PATCH | DELETE
  type: "open",             // "open" | "secure"
  handler: (req: AppRequest) => AppResponse.success({ data: {} }),
};
```

SimAPI discovers every named export from every `.ts` file inside `endpoints/` (or your configured `endpointsDir`). No registration needed.

## Grouping endpoints

Multiple endpoints can live in one file — group them by resource:

```ts
// endpoints/posts.ts
import { AppResponse, type EndpointDefinition } from "simapi";
import { makePost } from "../models/post.js";

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

Define a model file to keep your fake data factories in one place and reuse them across endpoints:

```ts
// models/post.ts
import { faker } from "simapi";

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

Import and use in any endpoint:

```ts
import { makePost } from "../models/post.js";

handler: () => AppResponse.success({ data: AppResponse.array(5, makePost) }),
```

## Path parameters

Use `:param` syntax:

```ts
export const getUser: EndpointDefinition = {
  path: "/api/users/:id",
  method: "GET",
  type: "open",
  handler: (req) => {
    const id = req.urlParam("id");
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
const name = req.body<string>("name");
const age  = req.body<number>("age");

// or the full body:
const all = req.bodyAll<{ name: string; age: number }>();
```

## Validation with Zod

Add a `validator` field with a Zod shape to validate the request body before the handler runs:

```ts
import { z, AppResponse, type AppRequest, type EndpointDefinition } from "simapi";

export const createUser: EndpointDefinition = {
  path: "/api/users",
  method: "POST",
  type: "open",
  validator: {
    email:    z.string().email(),
    password: z.string().min(8),
    age:      z.number().int().min(18).optional(),
  },
  handler: (req: AppRequest) => {
    req.errors.throwValidationError("laravel");
    return AppResponse.created({ data: { id: 1 } });
  },
};
```

`req.errors` is a `ValidationErrors` object populated before the handler is called. `throwValidationError` only throws when there are actual errors — calling it unconditionally is safe.

### Auto-throw

Set `autoThrowValidationErrors` in `simapi.config.ts` to skip the manual call entirely:

```ts
export default defineConfig({
  name: "my-api",
  autoThrowValidationErrors: "laravel", // or "zod"
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

Import `faker` (powered by faker-js) and use `AppResponse.array` to build collections:

```ts
import { faker, AppResponse, type EndpointDefinition } from "simapi";

export const getPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () =>
    AppResponse.success({
      data: AppResponse.array(5, () => ({
        id:        faker.string.ulid(),
        title:     faker.lorem.sentence(),
        body:      faker.lorem.paragraph(),
        published: faker.datatype.boolean(),
        author:    faker.person.fullName(),
      })),
      meta: { total: 5, page: 1, perPage: 20 },
    }),
};
```

`AppResponse.array(count, factory)` calls `factory` once per item so every element gets unique values.

## Simulating failures and latency

Set `failRate` and `delay` directly on the endpoint — SimAPI handles the rest:

```ts
export const getInventory: EndpointDefinition = {
  path: "/api/inventory",
  method: "GET",
  type: "open",
  failRate: 0.2,   // 20% chance of a 500 response
  delay: 800,      // always wait 800ms before responding
  handler: () => AppResponse.success({ data: [] }),
};
```

- **`failRate`** — probability (0–1) that the request returns `500 { message: "Simulated failure" }` instead of calling your handler.
- **`delay`** — milliseconds to wait before running the handler (simulates network latency or slow queries).

## Secure endpoints

Set `type: "secure"` and SimAPI runs your `authHandler` before the handler:

```ts
export const deleteUser: EndpointDefinition = {
  path: "/api/users/:id",
  method: "DELETE",
  type: "secure",
  handler: () => AppResponse.noContent(),
};
```

See [Configuration](/guide/config) for how to set up `authHandler`.
