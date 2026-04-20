# simapi

<img src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png" alt="SimAPI" width="120" />

> Mock backends that behave like real ones.

Build frontend features against real API behavior — before your backend exists. Define endpoints as plain TypeScript objects, generate realistic fake data with faker-js, and validate requests with Zod.

## Install

```sh
npm install simapi
```

Or scaffold a full project:

```sh
npm create simapi@latest my-api
```

## Quickstart

```sh
npx simapi init
npm run serve
```

## Defining an endpoint

```ts
import { faker, AppResponse, type EndpointDefinition } from "simapi";

export const getPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () =>
    AppResponse.success({
      data: AppResponse.array(5, () => ({
        id: faker.string.ulid(),
        title: faker.lorem.sentence(),
        published: faker.datatype.boolean(),
      })),
    }),
};
```

## Validation with Zod

```ts
import { z, AppResponse, type AppRequest } from "simapi";

export const createPost = {
  path: "/api/posts",
  method: "POST",
  type: "open",
  validator: {
    title: z.string(),
    body: z.string().min(12),
  },
  handler: (req: AppRequest) => {
    req.errors.throwValidationError("laravel");
    return AppResponse.created({ data: { id: faker.string.ulid() } });
  },
} as const;
```

## CLI commands

| Command | Description |
|---|---|
| `simapi serve` | Start dev server with live reload |
| `simapi build` | Compile to `.simapi/dist/server.mjs` |
| `simapi start` | Run compiled server |
| `simapi init` | Scaffold a new project |
| `simapi endpoint:create` | Scaffold a new endpoint |
| `simapi console:add` | Install the debug console |

## License

[MIT](../../LICENSE)
