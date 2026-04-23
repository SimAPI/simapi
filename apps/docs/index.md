---
layout: home

hero:
  name: SimAPI
  text: Build against reality, not assumptions.
  tagline: The local-first backend simulator for modern frontend engineering. Define real API behavior in TypeScript and ship your features before the backend exists.
  image:
    src: https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png
    alt: SimAPI
  actions:
    - theme: brand
      text: Get Started in 60s
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/SimAPI/simapi

features:
  - icon:
      src: /ts-feature.svg
    title: Code-First Intelligence
    details: Define your API as plain TypeScript objects. No decorators, no boilerplate, and no framework lock-in. Just pure, typed logic.
  - icon:
      src: /server-feature.svg
    title: Local-First DX
    details: Instant live-reloading with zero config. `simapi dev` auto-discovers your endpoints and provides a real HTTP server in seconds.
  - icon:
      src: /data-feature.svg
    title: Realistic Simulation
    details: Powered by faker-js. Generate dynamic, unique data for every request—from ULIDs and emails to complex user profiles.
  - icon:
      src: /logs-feature.svg
    title: Deep Observability
    details: Persistent logging to SQLite, libSQL, or Postgres. Inspect, filter, and replay requests directly from the debug console.
  - icon:
      src: /console-feature.svg
    title: Professional Validation
    details: First-class Zod integration. Validate request bodies, queries, and headers instantly and return formatted error bags automatically.
  - icon:
      src: /deploy-feature.svg
    title: Ship Anywhere
    details: Compiled to a single optimized Node.js entry. Deploy your mock server to Vercel, Netlify, Railway, or Docker with ease.
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
