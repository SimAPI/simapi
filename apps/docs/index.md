---
layout: home

hero:
  name: SimAPI
  text: Mock backends that behave like real ones.
  tagline: Build frontend features against real API behavior — before your backend exists.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/SimAPI/simapi

features:
  - title: TypeScript-first
    details: Define endpoints as plain TypeScript objects. No decorators, no classes, no magic.
  - title: Zero-config dev server
    details: Run `simapi serve` and your endpoints are live. Hot-reloading via tsx — no build step needed.
  - title: Realistic fake data
    details: AppResponse.fake generates unique values per item — strings, numbers, booleans, UUIDs, and arrays.
  - title: Request logging
    details: Every request is logged to SQLite, libSQL, or Postgres. Browse logs in the built-in console.
  - title: Live console
    details: Install @simapi/console for a real-time request inspector, schema viewer, and interactive tester.
  - title: Deploy anywhere
    details: Compile with `simapi build` and deploy to Railway, Render, Fly.io, or any Node.js host.
---
