---
layout: home

hero:
  name: SimAPI
  text: Mock backends that behave like real ones.
  tagline: Build frontend features against real API behavior — before your backend exists.
  image:
    src: /simapi.png
    alt: SimAPI
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/SimAPI/simapi

features:
  - icon:
      src: /ts-feature.svg
    title: TypeScript-first
    details: Define endpoints as plain TypeScript objects. No decorators, no classes, no magic.
  - icon:
      src: /server-feature.svg
    title: Zero-config dev server
    details: Run `simapi serve` and your endpoints are live. Hot-reloading via tsx — no build step needed.
  - icon:
      src: /data-feature.svg
    title: Realistic fake data
    details: AppResponse.fake generates unique values per item — strings, numbers, booleans, UUIDs, and arrays.
  - icon:
      src: /logs-feature.svg
    title: Request logging
    details: Every request is logged to SQLite, libSQL, or Postgres. Browse logs in the built-in console.
  - icon:
      src: /console-feature.svg
    title: Live console
    details: Install @simapi/console for a real-time request inspector, schema viewer, and interactive tester.
  - icon:
      src: /deploy-feature.svg
    title: Deploy anywhere
    details: Compile with `simapi build` and deploy to Railway, Render, Fly.io, or any Node.js host.
---

## Getting Started

The fastest way to spin up a new SimAPI project:

```sh
npm create simapi@latest next-api
cd next-api
npm run serve
```

Your mock server is now running at `http://localhost:3000`.

Need more details? Check out our [Full Guide](/guide/) or explore the [API Reference](/api/app-request).

