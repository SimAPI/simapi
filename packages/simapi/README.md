# simapi

<img src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png" alt="SimAPI" width="120" style="display: block; margin: 10px auto; border-radius: 10px;" />

> Mock backends that behave like real ones.

**[Documentation](https://simapi.mayrlabs.com)** | **[Quickstart](#quickstart)** | **[Github](https://github.com/SimAPI/simapi)**

Build frontend features against real API behavior — before your backend exists. SimAPI lets you define endpoints as plain TypeScript objects, generate realistic fake data with faker-js, validate requests with Zod, and log everything to a database.

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

## Grouping endpoints

Multiple endpoints in one file, reusing a shared model:

```ts
// models/post.ts
import { faker } from "simapi";
export interface Post { id: string; title: string; published: boolean; }
export function makePost(): Post {
  return { id: faker.string.ulid(), title: faker.lorem.sentence(), published: faker.datatype.boolean() };
}
```

```ts
// endpoints/posts.ts
import { z, AppResponse, type EndpointDefinition } from "simapi";
import { makePost } from "../models/post.js";

export const listPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () => AppResponse.success({ data: AppResponse.array(10, makePost) }),
};

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",
  validator: { title: z.string().min(3), body: z.string().min(10) },
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({ data: makePost() });
  },
};
```

## Simulating failures and latency

```ts
export const getOrders: EndpointDefinition = {
  path: "/api/orders",
  method: "GET",
  type: "open",
  failRate: 0.1,  // 10% chance of a 500 error
  delay: 300,     // 300ms artificial latency
  handler: () => AppResponse.success({ data: [] }),
};
```

## OpenAPI import

Generate endpoint stubs from an existing spec:

```sh
simapi import openapi.yaml --output endpoints/
```

## CLI commands

| Command                        | Description                          |
| ------------------------------ | ------------------------------------ |
| `simapi serve`                 | Start dev server with live reload    |
| `simapi build`                 | Compile to `.simapi/dist/server.mjs` |
| `simapi start`                 | Run compiled server                  |
| `simapi init`                  | Scaffold a new project               |
| `simapi import <spec>`         | Generate stubs from an OpenAPI spec  |
| `simapi console:add`           | Install the debug console            |

## License

[MIT](../../LICENSE)
