# About SimAPI

SimAPI is the plug-and-play backend simulator for modern development teams. It allows you to build, test, and document your frontend features against real API behavior before your actual backend exists.

## The Problem

Frontend development often outpaces backend development. When the API isn't ready, developers usually face three bad options:
1.  **Wait**: Productivity stalls while waiting for the backend team.
2.  **Hardcode**: Embedding fake data directly in the frontend code, which is hard to maintain and doesn't simulate real-world errors or latency.
3.  **Complex Mocks**: Spending hours setting up complex mocking libraries that are tightly coupled to a specific framework.

## The Approach

SimAPI takes a **code-first, local-first** approach. You define your API using standard TypeScript, and SimAPI spins up a real HTTP server that behaves exactly like a production backend.

-   **TypeScript-First**: Use the tools you already know. Get full type safety and IDE support.
-   **Realistic Simulation**: Simulate everything from auth flows and Zod validation to network latency and random server failures.
-   **Framework Agnostic**: Works with React, Vue, Next.js, Flutter, Swift, or any other stack that speaks HTTP.

## Quick Example

Creating a mock endpoint is as simple as exporting a constant:

```ts
import { AppResponse, faker } from "@simapi/simapi";

export const getProfile = {
  path: "/api/profile",
  method: "GET",
  type: "open",
  handler: () => {
    return AppResponse.success({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
    });
  },
};
```

## Why SimAPI?

| Feature             | SimAPI           | Postman Mocks | MSW        | JSON-Server |
| ------------------- | ---------------- | ------------- | ---------- | ----------- |
| **Setup Time**      | < 60 seconds     | Hours (GUI)   | Low/Medium | Low         |
| **Auth Simulation** | ✅ Built-in       | ❌ Limited     | ⚠️ Manual   | ❌ No        |
| **Validation**      | ✅ Zod Integrated | ❌ No          | ⚠️ Manual   | ❌ No        |
| **Debug UI**        | ✅ Rich Console   | ❌ No          | ❌ No       | ❌ No        |
| **OpenAPI Sync**    | ✅ Bi-directional | ⚠️ Limited     | ❌ No       | ❌ No        |
| **Type Safety**     | ✅ Full TS        | ❌ No          | ✅ Yes      | ❌ No        |

### How SimAPI is better:
- **VS Postman**: SimAPI lives in your repository, not a cloud GUI. It's version-controlled alongside your code.
- **VS MSW**: SimAPI is a real server. You don't need to intercept browser requests or worry about service worker lifecycle.
- **VS JSON-Server**: SimAPI is dynamic. Your handlers are functions, allowing for complex logic, stateful responses, and realistic data generation.

## Getting Started

1.  **Initialize**:
    ```bash
    npx simapi init my-mock-server
    ```
2.  **Run**:
    ```bash
    cd my-mock-server && npm install && npm run dev
    ```
3.  **Point your frontend** to `http://localhost:3000`.

## Philosophy

-   **Code is for Humans**: We prioritize readability and maintainability.
-   **No Assumptions**: SimAPI doesn't assume your tech stack. It provides the building blocks; you decide how to use them.
-   **Productivity First**: Every feature in SimAPI is designed to help you build features faster.

## Contributing

We love contributions! Check out our [CONTRIBUTING.md](packages/simapi/CONTRIBUTING.md) to get started.

## License

SimAPI is released under the MIT License. See [LICENSE](LICENSE) for details.

---

Built with ❤️ by [MayR Labs](https://mayrlabs.com).
