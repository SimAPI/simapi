# AuthHandler

An `AuthHandler` is a function that inspects an incoming request and optionally rejects it. It is used both globally in the config and per-endpoint.

## Signature

```ts
type AuthHandler = (
  req: AppRequest
) => AppResponse | void | Promise<AppResponse | undefined>;
```

- **`req`**: The incoming [`AppRequest`](/api/app-request) instance.
- **Return Value**: 
  - Return an [`AppResponse`](/api/app-response) (e.g., `AppResponse.unauthenticated()`) to reject the request and send that response immediately.
  - Return `undefined`, `null`, or `void` to allow the request to proceed.

## Global Auth Handler

Global handlers are defined in `simapi.config.ts` and run for every endpoint marked as `type: "secure"`.

```ts
// simapi.config.ts
import { defineConfig, AppResponse } from "@simapi/simapi";

export default defineConfig({
  authHandler: (req) => {
    if (!req.header("Authorization")) {
      return AppResponse.unauthenticated({ message: "Token required" });
    }
  }
});
```

## Per-Endpoint Auth Handler

You can also define a handler specifically for one endpoint. It runs after the global handler (if the endpoint is secure) or as the primary check (if the endpoint is open but has an `authHandler`).

```ts
export const deletePost: EndpointDefinition = {
  path: "/api/posts/:id",
  method: "DELETE",
  type: "secure",
  authHandler: (req) => {
    // Additional check specific to this endpoint
    if (req.urlParam("id") === "1") {
       return AppResponse.unauthorised({ message: "Cannot delete protected post" });
    }
  },
  handler: () => AppResponse.noContent()
};
```

## Built-in Auth Handlers

SimAPI includes the `AuthHandlers` factory for common authentication schemes.

### `bearer(token?)`
Requires `Authorization: Bearer <token>`. If `token` is provided, it must match exactly.

### `apiKey(name, via)`
Requires an API key. `via` can be `"header"`, `"query"`, or `"cookie"`.

### `basic(username?, password?)`
Requires Basic Auth. If credentials are provided, they must match.

### `jwt(secret)`
(Coming soon) Validates a JWT signature.
