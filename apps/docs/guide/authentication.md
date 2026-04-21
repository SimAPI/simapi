# Authentication

SimAPI supports flexible authentication at two levels: a **global handler** in `defineConfig` that applies to all `secure` endpoints, and a **per-endpoint handler** that adds extra checks on individual routes.

## Global auth handler

Set `authHandler` in your config to protect all `type: "secure"` endpoints:

```ts
// simapi.config.ts
import { defineConfig, AuthHandlers } from "simapi";

export default defineConfig({
  name: "my-api",
  authHandler: AuthHandlers.bearer(),
});
```

Any endpoint with `type: "secure"` will run this handler before reaching the route logic. If the handler returns an `AppResponse`, that response is sent immediately and the handler is skipped.

```ts
export const listOrders: EndpointDefinition = {
  path: "/api/orders",
  method: "GET",
  type: "secure",   // ← global authHandler runs here
  handler: () => AppResponse.success({ data: [] }),
};
```

## Built-in handlers (`AuthHandlers`)

SimAPI ships a collection of pre-built factories for common schemes. They validate that the credential is **present and well-formed** — they do not verify the actual secret value, which is the right behaviour for a mock server.

### `AuthHandlers.bearer()`

Requires `Authorization: Bearer <token>`. Passes if any non-empty token is provided.

```ts
authHandler: AuthHandlers.bearer()
// ✓  Authorization: Bearer abc123
// ✗  (no header)
// ✗  Authorization: Token abc123
```

### `AuthHandlers.jwt()`

Like `bearer()` but also validates the three-part JWT structure (`header.payload.signature`). Does not verify the signature.

```ts
authHandler: AuthHandlers.jwt()
// ✓  Authorization: Bearer eyJ....eyJ....abc
// ✗  Authorization: Bearer notajwt
```

### `AuthHandlers.basic()`

Requires `Authorization: Basic <base64(username:password)>`. Validates that the value decodes to a `username:password` string.

```ts
authHandler: AuthHandlers.basic()
// ✓  Authorization: Basic dXNlcjpwYXNz
// ✗  Authorization: Basic invalidbase64!!!
```

### `AuthHandlers.apiKey(name, via)`

Requires an API key passed in a header or query parameter.

```ts
// Via header (default)
authHandler: AuthHandlers.apiKey("x-api-key", "header")
// ✓  X-Api-Key: sk_live_...

// Via query parameter
authHandler: AuthHandlers.apiKey("api_key", "queryParam")
// ✓  GET /api/items?api_key=sk_live_...
```

### `AuthHandlers.cookie(name)`

Requires a specific cookie to be present on the request.

```ts
authHandler: AuthHandlers.cookie("session_id")
// ✓  Cookie: session_id=abc123; other=val
// ✗  (no Cookie header, or cookie missing)
```

### `AuthHandlers.oauth2()`

Requires an OAuth 2.0 Bearer token. Functionally identical to `bearer()` — use when you want to be explicit about the scheme.

```ts
authHandler: AuthHandlers.oauth2()
```

### `AuthHandlers.hmac()`

Requires an HMAC signature header. Checks for `X-Signature`, `X-HMAC-Signature`, or `X-Hub-Signature-256`. Does not verify the signature value.

```ts
authHandler: AuthHandlers.hmac()
// ✓  X-Signature: sha256=abc123...
```

### `AuthHandlers.digest()`

Requires HTTP Digest authentication (`Authorization: Digest ...`).

```ts
authHandler: AuthHandlers.digest()
// ✓  Authorization: Digest username="alice", realm="api", ...
```

## Custom auth handler

For anything beyond the built-ins, write your own handler directly:

```ts
import { defineConfig, AppResponse, type AuthHandler } from "simapi";

const authHandler: AuthHandler = (req) => {
  const token = req.header("Authorization");

  if (!token) {
    return AppResponse.unauthenticated({ message: "Missing Authorization header" });
  }

  // Return nothing (or undefined) to let the request proceed.
};

export default defineConfig({
  name: "my-api",
  authHandler,
});
```

Custom handlers can also be `async`:

```ts
const authHandler: AuthHandler = async (req) => {
  const token = req.header("x-api-key") ?? "";
  const valid = await validateToken(token);   // your own logic
  if (!valid) return AppResponse.unauthenticated({ message: "Invalid key" });
};
```

## Per-endpoint auth handler

Individual endpoints can define their own `authHandler`. This runs **in addition to** the global handler (not instead of it) — useful for endpoints that need extra checks beyond the global policy.

```ts
export const adminPanel: EndpointDefinition = {
  path: "/api/admin",
  method: "GET",
  type: "secure",   // global authHandler runs first
  authHandler: (req) => {
    // then this runs — extra check for admin role
    const role = req.header("x-user-role");
    if (role !== "admin") {
      return AppResponse.unauthorised({ message: "Admin access required." });
    }
  },
  handler: () => AppResponse.success({ data: { panel: true } }),
};
```

The per-endpoint `authHandler` also works on `open` endpoints — it runs alone (no global check):

```ts
export const webhook: EndpointDefinition = {
  path: "/api/webhook",
  method: "POST",
  type: "open",
  authHandler: AuthHandlers.hmac(),  // only this runs
  handler: () => AppResponse.success({}),
};
```

### Execution order for `secure` + per-endpoint auth

1. Global `authHandler` from config → if it returns a response, stop
2. Endpoint's own `authHandler` → if it returns a response, stop
3. Delay (`delay` ms)
4. Zod validation
5. Fail-rate check
6. Handler

## `AppResponse` helpers for auth failures

| Method | Status | When to use |
|---|---|---|
| `AppResponse.unauthenticated(body)` | 401 | Credential missing or invalid |
| `AppResponse.unauthorised(body)` | 403 | Credential valid but insufficient permissions |
