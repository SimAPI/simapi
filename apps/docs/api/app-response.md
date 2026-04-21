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
// → 404 Not Found   (default body: { message: "Not found" })
```

### `AppResponse.error(payload?)`

```ts
return AppResponse.error({ message: "Something went wrong" });
// → 500   (default body: { message: "Internal server error" })
```

## `AppResponse.array(count, factory)`

Creates an array of `count` items by calling `factory` once per item. Use with `faker` to generate realistic list responses:

```ts
import { faker, AppResponse } from "@simapi/simapi";

AppResponse.array(5, () => ({
  id:    faker.string.ulid(),
  name:  faker.person.fullName(),
  email: faker.internet.email(),
}))
```

Every element gets independently generated values — `faker` is called fresh per item.

## Simulating failures and latency

Failures and latency are configured on the `EndpointDefinition` directly, not on `AppResponse`:

```ts
export const getOrders: EndpointDefinition = {
  path: "/api/orders",
  method: "GET",
  type: "open",
  failRate: 0.2,   // 20% chance of 500 — no handler code needed
  delay: 500,      // always wait 500ms before responding
  handler: () => AppResponse.success({ data: [] }),
};
```

See [Defining Endpoints — Simulating failures](/guide/endpoints#simulating-failures-and-latency) for full details.
