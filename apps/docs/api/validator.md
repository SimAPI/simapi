# Validation

SimAPI uses [Zod](https://zod.dev) for request validation. Import `z` directly from `simapi`:

```ts
import { z } from "simapi";
```

## Endpoint validator

Add a `validator` field to your endpoint definition with a Zod shape:

```ts
import { z, AppResponse, type AppRequest, type EndpointDefinition } from "simapi";

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "open",
  validator: {
    title: z.string().min(3),
    body:  z.string(),
    tags:  z.array(z.string()).optional(),
  },
  handler: (req: AppRequest) => {
    req.errors.throwValidationError("laravel");
    return AppResponse.created({ data: { id: 1 } });
  },
};
```

The validator runs before the handler. Results are accessible via `req.errors`.

## `req.errors`

| Property | Type | Description |
|---|---|---|
| `hasError` | `boolean` | `true` if any field failed |
| `errorFields` | `string[]` | Names of failing fields |
| `errorBag` | `Record<string, string[]>` | Field → error messages |
| `throwValidationError(format?)` | `void` | Throws 422 **only when `hasError` is true** |

## Auto-throw

Set `autoThrowValidationErrors` in `simapi.config.ts` to throw automatically before the handler runs:

```ts
export default defineConfig({
  name: "my-api",
  autoThrowValidationErrors: "laravel",
});
```

With this setting, no manual `throwValidationError` call is needed.

## Common Zod schemas

```ts
z.string()              // any string
z.string().email()      // valid email
z.string().min(3)       // at least 3 chars
z.string().max(255)     // at most 255 chars
z.string().ulid()       // ULID format
z.string().uuid()       // UUID format

z.number()              // any number
z.number().int()        // integer
z.number().min(0)       // non-negative

z.boolean()             // true | false

z.array(z.string())     // array of strings
z.object({ ... })       // nested object

z.string().optional()   // field may be absent
z.string().nullable()   // field may be null
```

See the [Zod documentation](https://zod.dev) for the full API.

## Error formats

### Laravel (`"laravel"`)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Invalid email"],
    "password": ["String must contain at least 8 character(s)"]
  }
}
```

### Zod (`"zod"`)

```json
{
  "issues": [
    { "path": ["email"],    "message": "Invalid email" },
    { "path": ["password"], "message": "String must contain at least 8 character(s)" }
  ]
}
```
