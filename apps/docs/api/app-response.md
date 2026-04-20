# AppResponse

All endpoint handlers must return an `AppResponse`. Use the static factory methods — never instantiate directly.

## Success responses

### `AppResponse.success(payload?)`

```ts
return AppResponse.success({ data: { id: 1, name: "Alice" } });
// → 200 OK
```

### `AppResponse.created(payload?)`

```ts
return AppResponse.created({ data: { id: 42 } });
// → 201 Created
```

### `AppResponse.noContent()`

```ts
return AppResponse.noContent();
// → 204 No Content
```

## Error responses

### `AppResponse.unauthenticated(payload?)`

```ts
return AppResponse.unauthenticated({ message: "Missing token" });
// → 401 Unauthorized
```

### `AppResponse.unauthorised(payload?)`

```ts
return AppResponse.unauthorised({ message: "Forbidden" });
// → 403 Forbidden
```

### `AppResponse.notFound(payload?)`

```ts
return AppResponse.notFound({ message: "Post not found" });
// → 404 Not Found (default body: { message: "Not found" })
```

### `AppResponse.error(payload?)`

```ts
return AppResponse.error({ message: "Something went wrong" });
// → 500 (default body: { message: "Internal server error" })
```

## Simulation helpers

### `AppResponse.fail(probability)`

Returns an error response with the given probability (0–1), or `undefined`.

```ts
const maybeError = AppResponse.fail(0.3); // 30% chance
if (maybeError) return maybeError;
```

### `AppResponse.delay(ms)`

Awaitable artificial delay. Call before returning to simulate network latency.

```ts
await AppResponse.delay(500);
return AppResponse.success({ data: {} });
```

## `AppResponse.array(count, factory)`

Creates an array of `count` items by calling `factory` once per item. Use this with `faker` to generate realistic list responses:

```ts
import { faker, AppResponse } from "simapi";

AppResponse.array(5, () => ({
  id:    faker.string.ulid(),
  name:  faker.person.fullName(),
  email: faker.internet.email(),
}))
```
