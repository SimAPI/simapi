# FAQ

Common questions and troubleshooting tips for SimAPI.

## Validations

### Why are my validations not failing?
By default, SimAPI validates incoming requests and populates `req.errors`, but it does **not** stop the handler from running. This allows you to handle errors manually or return partial data.

To automatically return a `422 Unprocessable Entity` response when validation fails, enable `autoThrowValidationErrors` in your config:

```typescript
// simapi.config.ts
import { defineConfig } from "@simapi/simapi";

export default defineConfig({
  // ...
  autoThrowValidationErrors: "laravel", // or "zod" // [!code focus]
});
```

### Can I customize the validation error response?
Yes! You can use the `validationErrorFormatter` option in your config to return a custom object when validation fails.

```typescript
// simapi.config.ts
export default defineConfig({
  validationErrorFormatter: (errors) => {
    return {
      status: "error",
      message: "Validation failed",
      fields: errors
    };
  }
});
```

## Development

### How do I handle CORS?
SimAPI enables CORS by default, allowing all origins, methods, and headers. This ensures that your frontend applications running on different ports (e.g., `localhost:5173`) can communicate with the SimAPI server without additional configuration.

### How do I handle file uploads?
SimAPI handles `multipart/form-data` automatically. You can validate the presence of fields using the `form` field in your `RequestDefinition`.

```ts
request: {
  form: {
    avatar_url: z.string().url(),
  }
}
```
> [!INFO] File upload <Badge type="tip" text="Coming Soon" />
> Currently, SimAPI does not support binary file storage. We recommend using `faker.image.url()` to return a mock URL for uploaded files in your responses.

### How do I use environment variables?
SimAPI supports `.env` files automatically. You can access your environment variables using `process.env` in your config or endpoint handlers.

```ts
// simapi.config.ts
export default defineConfig({
  database: {
    type: "postgres",
    url: process.env.DATABASE_URL!
  }
});
```
