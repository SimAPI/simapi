# SimAPI Vision

> [!TIP]
> Hardcoding JSON lies to your frontend. SimAPI gives you a real backend experience — routing, auth, validation, and errors — before your backend even exists.

**Build against reality, not assumptions.**

## The Problem

Modern frontend development is often blocked by backend availability. When the API doesn't exist yet, we resort to hacks:
- **Hardcoded JSON**: Lies about network latency, auth flows, and validation errors.
- **Postman Mocks**: Tedious to maintain and disconnected from your code.
- **Framework Mocks**: Locked into a specific stack and hard to reuse.

We needed a tool that feels like a real backend, runs locally, and scales with your project.

## The Vision

SimAPI is a **local-first backend simulator** that lets you build frontend features against real API behavior. It's not just a mock server; it's a development partner that helps you define, test, and document your API before a single line of "real" backend code is written.

### 1. Code-First, Not Config-First
Define your API in **real TypeScript**. Get full type safety, autocomplete, and the power of a programming language. No more wrestling with giant JSON blobs or proprietary GUI tools.

### 2. Built for Reality
Simulation isn't just about successful responses. SimAPI makes it easy to simulate:
- **Validation**: Integrated Zod support for request body, query, and headers.
- **Auth**: Pre-built handlers for Bearer, JWT, API Keys, and more.
- **Latency**: Built-in `delay` to simulate slow networks or heavy DB queries.
- **Flakiness**: `failRate` to test how your frontend handles 500 errors.

### 3. Visual Debugging
The **SimAPI Console** provides a professional-grade UI to inspect live request logs, browse auto-generated documentation, and test endpoints interactively.

### 4. Seamless Workflow
From `npx simapi init` to `simapi build`, the workflow is designed to be frictionless.
- **Interactive CLI**: Scaffold endpoints and projects with ease.
- **OpenAPI Sync**: Import existing specs to generate stubs, or export your mock to OpenAPI for the backend team.
- **Deploy Anywhere**: Auto-detects Vercel and Netlify for serverless deployment, or runs as a standard Node.js process on Railway/Docker.

## The Architecture

SimAPI is built on **[Hono](https://hono.dev)**, the fastest web framework for the edges. It uses **[Drizzle ORM](https://orm.drizzle.team)** for persistent logging and **[Faker.js](https://fakerjs.dev)** for generating realistic data.

```ts
// Example: A realistic secure endpoint
import { AppResponse, AuthHandlers, z } from "@simapi/simapi";

export const createUser = {
  path: "/api/users",
  method: "POST",
  type: "secure",
  title: "Create User",

  // Validation is first-class
  request: {
    body: {
      email: z.string().email(),
      role:  z.enum(["admin", "user"]),
    }
  },

  // Simulate real-world conditions
  delay: 400,
  failRate: 0.05,

  handler: (req) => {
    // Throw validation errors formatted for your frontend (e.g., Laravel style)
    req.errors.throwValidationError("laravel");

    return AppResponse.created({
      id: AppResponse.fake.string.uuid(),
      ...req.bodyAll(),
      createdAt: new Date().toISOString(),
    });
  },
};
```

## Our Philosophy

- **Human-centric**: Code is for humans first. We prefer boring, predictable patterns over "clever" abstractions.
- **Framework Agnostic**: SimAPI doesn't care if you use React, Vue, Flutter, or Swift. If it talks HTTP, it works with SimAPI.
- **Zero Friction**: Get a server running in 30 seconds. No global installs, no complex setup.

---

SimAPI is about closing the gap between frontend imagination and backend reality. Let's build something real.
