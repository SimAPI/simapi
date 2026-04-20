# Validator

`Validator` provides composable validation rules for `req.validateBody()`.

```ts
import { Validator } from "simapi";

const errors = req.validateBody({
  email:    [Validator.required(), Validator.email()],
  password: [Validator.required(), Validator.minLength(8)],
  age:      [Validator.number()],
});

if (errors.hasError) {
  errors.throwValidationError("laravel");
}
```

## Rules

### `Validator.required()`

The field must be present and non-empty (not `undefined`, `null`, or `""`).

### `Validator.string()`

The value must be a string (or absent — combine with `required()` to enforce presence).

### `Validator.number()`

The value must be a number or a numeric string.

### `Validator.boolean()`

The value must be a boolean or the strings `"true"` / `"false"`.

### `Validator.email()`

The value must be a valid email address.

### `Validator.minLength(n)`

The value (string) must be at least `n` characters.

```ts
Validator.minLength(8)
```

### `Validator.maxLength(n)`

The value (string) must be at most `n` characters.

```ts
Validator.maxLength(255)
```

## Error format

`throwValidationError("laravel")` — responds 422 in Laravel's format:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

`throwValidationError("zod")` — responds 422 in Zod's format:

```json
{
  "issues": [
    { "path": ["email"], "message": "The email field is required." }
  ]
}
```
