# OpenAPI Import & Export

SimAPI can round-trip with OpenAPI 3 specs: import a spec to generate endpoint stubs, or export your endpoints to generate a spec.

## Import — generate stubs from a spec

If a backend spec already exists but the implementation is still in progress, you can import it to generate typed endpoint stubs, Zod request schemas, and mock data factories.

```sh
# Using the OpenAPI package directly
npx @simapi/openapi import openapi.yaml
npx @simapi/openapi import openapi.json --output ./src
```

Both YAML and JSON specs are supported, including **OpenAPI 3.0.x** and **OpenAPI 3.1.x**.

| Option           | Default | Description                        |
| ---------------- | ------- | ---------------------------------- |
| `--output`, `-o` | `./`    | Directory to write generated files |

### What gets generated

SimAPI uses the **Tags** defined in your OpenAPI spec to group endpoints into logical files. The importer creates a structured output:

```
src/
├── endpoints/        # Endpoint definitions and handlers
│   ├── pets.ts
│   └── users.ts
├── requests/         # Zod validation schemas
│   ├── pets.ts
│   └── users.ts
└── models/           # Types and Mock factories
    ├── Pet.ts
    └── User.ts
```

#### 1. Models & Factories
Each schema in `components/schemas` gets its own file with a Zod schema, a TypeScript type, and a recursive `make{Model}` factory powered by `@faker-js/faker`.

```ts
// src/models/Pet.ts
export const PetSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export type Pet = z.infer<typeof PetSchema>;

export const makePet = (overrides?: Partial<Pet>): Pet => ({
  id: faker.number.int(),
  name: faker.string.alphanumeric(),
  ...overrides,
});
```

#### 2. Request Schemas
Zod shapes are generated for request bodies, query parameters, and headers. These are placed in `src/requests/` and are used by the endpoints.

#### 3. Endpoint Stubs
Endpoints are wired with their corresponding request schemas and handlers that return realistic mock data using the generated factories.

```ts
// src/endpoints/pets.ts
import { AppResponse, type EndpointDefinition } from "@simapi/simapi";
import { createPetRequest } from "../requests/pets.js";
import { makePet } from "../models/Pet.js";

export const createPet: EndpointDefinition = {
  path: "/pets",
  method: "POST",
  type: "secure",
  request: createPetRequest,
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({
      data: makePet(),
    });
  },
};
```

---

## Export — generate a spec from your endpoints

Introspect your endpoint definitions (including Zod validators) and produce an OpenAPI 3 spec you can share with your team or feed into documentation tools.

```sh
npx @simapi/openapi export
npx @simapi/openapi export --output docs/api.yaml
```

| Option           | Default          | Description      |
| ---------------- | ---------------- | ---------------- |
| `--output`, `-o` | `openapi.yaml`   | Output file path |

### What gets generated

For each endpoint:
- Path parameters extracted from `:param` segments
- Request body schema derived from the `request.body` Zod shape
- `security` added for `type: "secure"` endpoints
- Correct response status codes per HTTP method (200 GET, 201 POST, 204 DELETE)

The generated spec is a solid starting point for API documentation, code-gen, or handoff to the real backend team.
