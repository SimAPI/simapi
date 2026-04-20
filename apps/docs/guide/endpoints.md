# Defining Endpoints

## Endpoint shape

An endpoint is a plain TypeScript object with four required fields:

```ts
import { AppResponse, type AppRequest } from "simapi";

export const myEndpoint = {
  path: "/api/resource",       // Hono-style route pattern
  method: "GET",               // GET | POST | PUT | PATCH | DELETE
  type: "open",                // "open" | "secure"
  handler: (req: AppRequest) => {
    return AppResponse.success({ data: {} });
  },
} as const;
```

SimAPI discovers every named export from every `.ts` file inside `endpoints/`. No registration needed.

## Path parameters

Use `:param` syntax:

```ts
export const getUser = {
  path: "/api/users/:id",
  method: "GET",
  type: "open",
  handler: (req: AppRequest) => {
    const id = req.urlParam("id");
    return AppResponse.success({ data: { id } });
  },
} as const;
```

## Query parameters

```ts
const page = Number(req.param("page") ?? "1");
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

## Validation

```ts
import { Validator } from "simapi";

const errors = req.validateBody({
  email:    [Validator.required(), Validator.email()],
  password: [Validator.required(), Validator.minLength(8)],
});

if (errors.hasError) {
  errors.throwValidationError("laravel"); // or "zod"
}
```

`throwValidationError("laravel")` responds with `422 Unprocessable Entity` in Laravel's format:

```json
{
  "message": "The given data was invalid.",
  "errors": { "email": ["The email field is required."] }
}
```

## Fake data

```ts
AppResponse.fake.string(8)   // random 8-char string
AppResponse.fake.number(1, 100)
AppResponse.fake.boolean()
AppResponse.fake.uuid()
AppResponse.fake.array(5, () => ({
  id:   AppResponse.fake.uuid(),
  name: AppResponse.fake.string(6),
}))
```

Each `array()` call evaluates the factory per item, so every element gets unique values.

## Simulating failures

```ts
// 30% chance of returning undefined (no response → caller handles)
const maybeError = AppResponse.fail(0.3);
if (maybeError) return maybeError;

// Artificial delay
await AppResponse.delay(500);
```

## Secure endpoints

Set `type: "secure"` and SimAPI runs your `authHandler` before the handler:

```ts
export const deleteUser = {
  path: "/api/users/:id",
  method: "DELETE",
  type: "secure",   // authHandler runs first
  handler: (req: AppRequest) => AppResponse.success({ ok: true }),
} as const;
```

See [Configuration](/guide/config) for how to set up `authHandler`.
