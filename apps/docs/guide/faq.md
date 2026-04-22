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
