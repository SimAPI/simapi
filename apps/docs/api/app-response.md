# AppResponse

All endpoint handlers must return an `AppResponse`. Use the static factory methods — never instantiate directly.

## Success responses

### `AppResponse.success(payload)`

```ts
return AppResponse.success({ data: { id: 1, name: "Alice" } });
// → 200 OK
```

### `AppResponse.created(payload)`

```ts
return AppResponse.created({ data: { id: 42 } });
// → 201 Created
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

### `AppResponse.error(payload?, status?)`

```ts
return AppResponse.error({ message: "Not found" }, 404);
// → 404 (default 400 if status omitted)
```

## Simulation helpers

### `AppResponse.fail(probability)`

Returns an error response with the given probability (0–1), or `undefined` (no error).

```ts
const maybeError = AppResponse.fail(0.3); // 30% chance
if (maybeError) return maybeError;
```

When triggered, returns a 500-like error response.

### `AppResponse.delay(ms)`

Awaitable artificial delay. Call before returning to simulate network latency.

```ts
await AppResponse.delay(500); // wait 500ms
return AppResponse.success({ data: {} });
```

## Fake data — `AppResponse.fake`

### `.string(length?)`

Random alphanumeric string. Default length: 8.

```ts
AppResponse.fake.string()    // "a3Kx9mRt"
AppResponse.fake.string(16)
```

### `.number(min?, max?)`

Random integer in `[min, max]`. Defaults: `min=0`, `max=1000`.

```ts
AppResponse.fake.number(1, 100)
```

### `.boolean()`

Random `true` or `false`.

### `.uuid()`

Random UUID v4 string.

```ts
AppResponse.fake.uuid() // "110e8400-e29b-41d4-a716-446655440000"
```

### `.array(length, factory)`

Array of `length` items. The factory function is called once per item, so each gets unique values.

```ts
AppResponse.fake.array(5, () => ({
  id:   AppResponse.fake.uuid(),
  name: AppResponse.fake.string(6),
}))
```
