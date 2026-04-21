---
layout: home

hero:
  name: SimAPI
  text: Ship frontend features before the backend exists.
  tagline: Define real API behaviour in TypeScript. Get a running mock server in seconds. No backend team required.
  image:
    src: /simapi.png
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
    details: Add a `validator` field with a Zod shape. SimAPI validates the body before your handler runs and formats errors automatically.
  - icon:
      src: /deploy-feature.svg
    title: Deploy when you're ready
    details: "`simapi build` compiles your project to a single Node.js file. Deploy to Railway, Render, Fly.io, or any host."
---

## A full mock API in under a minute

One command to scaffold, one command to serve:

```sh
npx @simapi/simapi@latest init my-api
cd my-api
npm run serve
```

Your API is live at `http://localhost:3000`. Now define endpoints.

## Endpoints are just TypeScript

```ts
// endpoints/posts.ts
import { faker, z, AppResponse, type EndpointDefinition } from "@simapi/simapi";

export const listPosts: EndpointDefinition = {
  path: "/api/posts",
  method: "GET",
  type: "open",
  handler: () =>
    AppResponse.success({
      data: AppResponse.array(10, () => ({
        id:        faker.string.ulid(),
        title:     faker.lorem.sentence(),
        published: faker.datatype.boolean(),
        author:    faker.person.fullName(),
      })),
    }),
};

export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",
  validator: {
    title: z.string().min(3),
    body:  z.string().min(10),
  },
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({ data: { id: faker.string.ulid() } });
  },
};
```

Hit `GET /api/posts` — you get 10 unique posts. Hit `POST /api/posts` without a body — you get a formatted 422. No database, no server setup, no waiting.

## Works with your existing spec

Already have an OpenAPI spec? Generate stubs instantly:

```sh
simapi import openapi.yaml
```

Validators are wired automatically from the request body schema. Start serving in seconds.

---

**[Read the Guide](/guide/)** · **[API Reference](/api/app-request)** · **[GitHub](https://github.com/SimAPI/simapi)**
