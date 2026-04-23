<h1 align="center" style="margin-bottom: 0px;">SimAPI</h1>
<h3 align="center" style="margin: 0 0 30px 0;">Introduction</h3>
 
<p align="center">
  <img src="https://raw.githubusercontent.com/SimAPI/simapi/main/simapi.png" alt="SimAPI" width="160" style="display: block; border-radius: 10px;" />
</p>
 
<p align="center">
  <b>Mock backends that behave like real ones. Build against reality, not assumptions.</b>
</p>
 
**SimAPI** is a local-first backend simulator designed to bridge the gap between frontend imagination and backend reality. It allows development teams to build, test, and document their features against real API behavior before a single line of production backend code is ever written.
 
## Why SimAPI?
 
Modern frontend engineering often outpaces backend development. When the API isn't ready, developers are traditionally forced into three compromised paths:
 
1.  **The Waiting Game**: Productivity stalls while waiting for the backend team to ship an endpoint.
2.  **Hardcoded Lies**: Embedding static JSON directly in your code. It works, but it lies about network latency, authentication flows, and validation errors.
3.  **Complex Mocks**: Spending hours configuring mocking libraries that are disconnected from your actual repository and version control.
 
**SimAPI gives you a fourth option: Build the backend you wish you had.**
 
## How it Compares
 
| Feature             | SimAPI           | Postman Mocks | MSW        | JSON-Server |
| ------------------- | ---------------- | ------------- | ---------- | ----------- |
| **Setup Time**      | **< 60 seconds** | Hours (GUI)   | Medium     | Low         |
| **Auth Simulation** | ✅ **Built-in**   | ❌ Limited     | ⚠️ Manual   | ❌ No        |
| **Validation**      | ✅ **Zod Native** | ❌ No          | ⚠️ Manual   | ❌ No        |
| **Debug UI**        | ✅ **Console**    | ❌ No          | ❌ No       | ❌ No        |
| **OpenAPI Sync**    | ✅ **Bi-dir**     | ⚠️ Limited     | ❌ No       | ❌ No        |
| **Type Safety**     | ✅ **Full TS**    | ❌ No          | ✅ Yes      | ❌ No        |
 
### Why it's better:
- **Vs. Postman**: SimAPI lives in your repository, not a cloud GUI. It's version-controlled alongside your code and works offline.
- **Vs. MSW**: SimAPI is a real HTTP server. You don't need to intercept browser requests or worry about service worker lifecycles. It works for Mobile (Flutter/Swift) and Backend-to-Backend tests too.
- **Vs. JSON-Server**: SimAPI is dynamic. Your handlers are functions, allowing for complex logic, stateful responses, and realistic data generation with Faker.js.
 
## Key Benefits
 
### 🛠️ Code-First Intelligence
Define your API using plain TypeScript objects. No decorators, no complex classes, and no proprietary GUI tools. If you can write a TypeScript object, you can build a backend. Enjoy full type safety, autocomplete, and the ability to share models between your mock and your production code.
 
### 🧪 Realistic Simulation
True simulation isn't just about successful responses (the "happy path"). SimAPI empowers you to battle-test your frontend against:
-   **Strict Validation**: Integrated Zod support ensures your requests are strictly validated before your handler ever runs.
-   **Authentication**: Pre-built handlers for Bearer tokens, API keys, and custom auth logic.
-   **Network Reality**: Use the `delay` property to simulate slow connections and `failRate` to ensure your UI gracefully handles 500 errors.
 
### 🔍 Visual Debugging
The **SimAPI Console** is a professional-grade interface that transforms your mock server from a "black box" into a transparent development environment. Inspect live request logs, browse auto-generated documentation, and test endpoints interactively without leaving your browser.
 
## The Developer's Secret Weapon
 
Imagine building an entire feature—auth, paginated lists, form validation, and error states—on a flight with no internet, before the backend team has even finished the database schema. When you land, you hand them an OpenAPI spec generated from your SimAPI code.
 
**That is the SimAPI advantage.**
 
---
 
Ready to close the gap? **[Start your first project in 60 seconds →](/guide/getting-started)**
