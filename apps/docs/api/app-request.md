# AppRequest

Every endpoint handler receives an `AppRequest` instance as its only argument.

```ts
import type { AppRequest } from "simapi";

export const myEndpoint = {
  path: "/api/resource",
  method: "GET",
  type: "open",
  handler: (req: AppRequest) => { /* ... */ },
} as const;
```

## Methods

### `req.header(name)`

Returns the value of a request header (case-insensitive), or `undefined`.

```ts
const auth = req.header("Authorization");
```

### `req.body<T>(key)`

Returns the parsed value of a single field from the request body, cast to `T`.

```ts
const name = req.body<string>("name");
const age  = req.body<number>("age");
```

Returns `undefined` if the field is absent.

### `req.bodyAll<T>()`

Returns the entire parsed request body as `T`.

```ts
const all = req.bodyAll<{ name: string; age: number }>();
```

### `req.param(key)`

Returns a query string parameter.

```ts
const page  = Number(req.param("page") ?? "1");
const limit = Number(req.param("limit") ?? "20");
```

### `req.urlParam(key)`

Returns a URL path parameter (`:param` segment).

```ts
// path: "/api/users/:id"
const id = req.urlParam("id");
```

### `req.validateBody(rules)`

Runs validation rules against the request body. Returns a `ValidationErrors` object.

```ts
import { Validator } from "simapi";

const errors = req.validateBody({
  email:    [Validator.required(), Validator.email()],
  password: [Validator.required(), Validator.minLength(8)],
});

if (errors.hasError) {
  errors.throwValidationError("laravel"); // throws → 422
}
```

See [Validator](/api/validator) for available rules.

## ValidationErrors

The object returned by `validateBody()`.

| Property | Type | Description |
|---|---|---|
| `hasError` | `boolean` | `true` if any field failed validation |
| `errorFields` | `string[]` | Names of fields that failed |
| `errorBag` | `Record<string, string[]>` | Map of field → error messages |
| `throwValidationError(format)` | `void` | Throws a `ValidationError` that renders as 422. Format: `"laravel"` or `"zod"` |
