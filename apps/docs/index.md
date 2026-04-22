---
layout: home

hero:
  name: SimAPI
  text: Ship frontend features before the backend exists.
  tagline: Define real API behaviour in TypeScript. Get a running mock server in seconds. No backend team required.
  image:
    src: https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png
    alt: SimAPI
  actions:
    - theme: brand
      text: Get Started in 60s
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/SimAPI/simapi

features:
  - icon:
      src: /ts-feature.svg
    title: Plain TypeScript objects
    details: No decorators, no classes, no framework lock-in. An endpoint is just an exported object with a path, method, and handler.
  - icon:
      src: /server-feature.svg
    title: Zero-config dev server
    details: "`simapi serve` discovers every endpoint automatically and starts a live-reloading server. No build step, no config."
  - icon:
      src: /data-feature.svg
    title: Realistic fake data
    details: Powered by faker-js. Generate unique ULIDs, sentences, names, emails, and booleans per request — in one line.
  - icon:
      src: /logs-feature.svg
    title: Built-in request logging
    details: Every request logged to SQLite, libSQL, or Postgres. Filter, export, and replay from the debug console.
  - icon:
      src: /console-feature.svg
    title: Validation without boilerplate
    details: Add a `request` field with Zod shapes for body, query, and headers. SimAPI validates all three before your handler runs and formats errors automatically.
  - icon:
      src: /deploy-feature.svg
    title: Deploy when you're ready
    details: "`simapi build` compiles your project to a single Node.js file. Deploy to Railway, Render, Fly.io, or any host."
---

## A full mock API in under a minute

One command to scaffold, one command to start:

```sh
npx @simapi/simapi@latest init my-api
cd my-api
npm run dev
```

Your API is live at `http://localhost:3000`. Files in `src/` are watched — the server restarts automatically on every save.

## Minimal setup, massive speed

Everything you need to build a realistic backend simulation in a few files.

::: code-group

```ts [simapi.config.ts]
import { defineConfig } from "@simapi/simapi";

export default defineConfig({
  name: "blog-api",
  autoThrowValidationErrors: "laravel",
  database: { type: "sqlite", path: "./.simapi/db.sqlite" }
});
```

```ts [src/endpoints/posts.ts]
import { AppResponse, type EndpointDefinition } from "@simapi/simapi";
import { postRequest } from "@/requests/post.js";
import { makePost } from "@/models/post.js";

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",
  request: postRequest,
  handler: () => AppResponse.created({ data: makePost() }),
};
```

```ts [src/models/post.ts]
import { faker } from "@simapi/simapi";

export function makePost() {
  return {
    id: faker.string.ulid(),
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    published: faker.datatype.boolean(),
  };
}
```

```ts [src/requests/post.ts]
import { z, type RequestDefinition } from "@simapi/simapi";

export const postRequest: RequestDefinition = {
  body: {
    title: z.string().min(3),
    body: z.string().min(10),
  }
};
```

:::

Hit `GET /api/posts` — you get 10 unique posts. Hit `POST /api/posts` without a body — you get a formatted 422. No database, no server setup, no waiting.

## Works with your existing spec

Already have an OpenAPI spec? Generate stubs instantly:

```sh
simapi import openapi.yaml
```

Validators are wired automatically from the request body schema. Start serving in seconds.

---

**[Read the Guide](/guide/)** · **[API Reference](/api/app-request)** · **[GitHub](https://github.com/SimAPI/simapi)**
