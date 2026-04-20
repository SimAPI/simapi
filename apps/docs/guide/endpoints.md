# Defining Endpoints

## Endpoint shape

An endpoint is a plain TypeScript object with four required fields:

```ts
import { AppResponse, type AppRequest, type EndpointDefinition } from "simapi";

export const myEndpoint: EndpointDefinition = {
  path: "/api/resource",       // Hono-style route pattern
  method: "GET",               // GET | POST | PUT | PATCH | DELETE
  type: "open",                // "open" | "secure"
  handler: (req: AppRequest) => {
    return AppResponse.success({ data: {} });
  },
};
```

SimAPI discovers every named export from every `.ts` file inside `endpoints/` (or your configured `endpointsDir`). No registration needed.

## Path parameters

Use `:param` syntax:

```ts
export const getUser: EndpointDefinition = {
  path: "/api/users/:id",
  method: "GET",
  type: "open",
  handler: (req: AppRequest) => {
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
```

For the full body:

```ts
const all = req.bodyAll<{ name: string; age: number }>();
```

## Validation with Zod

Add a `validator` field with a Zod shape to validate the request body automatically before the handler runs:

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
    // throws 422 only if there are errors — no hasError check needed
    req.errors.throwValidationError("laravel");

    return AppResponse.created({ data: { id: 1 } });
  },
};
```

`req.errors` is a `ValidationErrors` object populated before the handler is called.

### Auto-throw

Set `autoThrowValidationErrors` in `simapi.config.ts` to skip the manual `throwValidationError` call entirely:

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

Import `faker` (powered by faker-js) and `AppResponse.array`:

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

## Simulating failures

```ts
// 30% chance of a 500 error
const maybeError = AppResponse.fail(0.3);
if (maybeError) return maybeError;

// Artificial delay
await AppResponse.delay(500);
```

## Secure endpoints

Set `type: "secure"` and SimAPI runs your `authHandler` before the handler:

```ts
export const deleteUser: EndpointDefinition = {
  path: "/api/users/:id",
  method: "DELETE",
  type: "secure",
  handler: (req: AppRequest) => AppResponse.success({ ok: true }),
};
```

See [Configuration](/guide/config) for how to set up `authHandler`.
