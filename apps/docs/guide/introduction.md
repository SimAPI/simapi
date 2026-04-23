<h1 align="center" style="margin-bottom: 0px;">SimAPI</h1>
<h3 align="center" style="margin: 0 0 30px 0;">Introduction</h3>

<p align="center">
  <img src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png" alt="SimAPI" width="160" style="display: block; border-radius: 10px;" />
</p>

<p align="center">
  Mock backends that behave like real ones.
</p>

**SimAPI** is a local-first backend simulator designed to bridge the gap between frontend imagination and backend reality. It allows development teams to build, test, and document their features against real API behavior before a single line of production backend code is ever written.

## The Developer's Dilemma

Modern frontend engineering often outpaces backend development. When the API isn't ready, developers are traditionally forced into three compromised paths:
1.  **The Waiting Game**: Productivity stalls while waiting for the backend team to ship an endpoint.
2.  **Hardcoded Lies**: Embedding static JSON directly in your code. It works, but it lies about network latency, authentication flows, and validation errors.
3.  **Complex Mocking**: Spending hours configuring heavy mocking libraries that are disconnected from your actual repository and version control.

**SimAPI gives you a fourth option: Build against reality.**

## Build Against Reality, Not Assumptions

SimAPI takes a **code-first, local-first** approach. By defining your API as plain TypeScript objects within your repository, you spin up a real HTTP server that mimics your future production environment with surgical precision.

### 🛠️ Code-First Architecture
No decorators, no complex classes, and no proprietary GUI tools. If you can write a TypeScript object, you can build a backend. Enjoy full type safety, autocomplete, and the ability to share models between your mock and your production code.

### 🧪 Realistic Simulation
True simulation isn't just about successful responses (the "happy path"). SimAPI empowers you to battle-test your frontend against:
-   **Validation**: Integrated Zod support ensures your requests are strictly validated before your handler ever runs.
-   **Authentication**: Built-in handlers for Bearer tokens, API keys, and custom logic.
-   **Latency & Errors**: Use the `delay` property to simulate slow connections and `failRate` to ensure your UI gracefully handles 500 errors.

### 🔍 Visual Debugging
The **SimAPI Console** is a professional-grade interface that transforms your mock server from a "black box" into a transparent development environment. Inspect live request logs, browse auto-generated documentation, and test endpoints interactively without leaving your browser.

## Core Philosophy

-   **Code for Humans**: We prioritize readable, predictable patterns. No "clever" abstractions that hide how the server actually works.
-   **Framework Agnostic**: SimAPI doesn't care if you use React, Vue, Next.js, Flutter, or Swift. If it speaks HTTP, it works with SimAPI.
-   **Local-First, Always**: Your mocks are versioned alongside your code. No cloud dependencies, no internet required, and no hidden costs.

---

Ready to close the gap? **[Start your first project in 60 seconds →](/guide/)**
