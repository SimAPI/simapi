# AppRequest

Every endpoint handler receives an `AppRequest` instance as its only argument.

```ts
import type { AppRequest } from "@simapi/simapi";

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
const page  = Number(req.param("page")  ?? "1");
const limit = Number(req.param("limit") ?? "20");
```

### `req.urlParam(key)`

Returns a URL path parameter (`:param` segment).

```ts
// path: "/api/users/:id"
const id = req.urlParam("id");
```

## req.errors

`req.errors` is a `ValidationErrors` object populated before the handler is called, when the endpoint defines a `request`. It is always present (empty when no `request` field or when validation passes).

```ts
req.errors.throwValidationError("laravel"); // throws 422 only when hasError is true
```

See [Validator](/api/validator) and [Defining Endpoints — Validation](/guide/endpoints#validation-with-zod) for full details.

## ValidationErrors

| Property | Type | Description |
|---|---|---|
| `hasError` | `boolean` | `true` if any field failed validation |
| `errorFields` | `string[]` | Names of fields that failed |
| `errorBag` | `Record<string, string[]>` | Map of field → error messages |
| `throwValidationError(format?)` | `void` | Throws a 422 **only when `hasError` is true**. Format: `"laravel"` (default) or `"zod"` |
