# Debug Console

`@simapi/console` is an optional browser-based UI for inspecting live requests, browsing your endpoint schema, and firing test requests — all without leaving the browser.

## Installation

```sh
npx simapi console:add
```

This installs `@simapi/console` and adds it as a dependency. To remove it:

```sh
npx simapi console:remove
```

## Accessing the console

Start the dev server and open:

**http://localhost:3000/__simapi/console/**

The console is only mounted when `@simapi/console` is installed. It is served alongside your endpoints — no separate server needed. It supports **light and dark mode** — toggle with the button in the sidebar footer.

## Overview page

The landing page shows your server's status and the available internal SimAPI API:

- **Server card** — name, version, and online/offline indicator
- **Stats** — endpoint count and logging status
- **Internal API table** — all `/__simapi/*` routes available for programmatic use

## Request Logs page

Every request logged to your database appears here in real time via a Server-Sent Events stream. New rows appear at the top without a page refresh.

### Log columns

| Column | Description |
|---|---|
| **Time** | Timestamp of the request |
| **Method** | HTTP method badge (color-coded) |
| **Path** | The matched route path including query string |
| **Status** | Response status code (green 2xx, yellow 4xx, red 5xx) |
| **ms** | Duration from request received to response sent |

### Log detail modal

Click any row to open a **detail modal** showing:

- Request headers (parsed as a key/value table)
- Request body (JSON-formatted)
- Response status and body (JSON-formatted)
- Duration in milliseconds

The modal also has a **Delete** button to remove the entry from the database.

### Filtering

Use the filter bar to narrow results by path or method prefix.

### JSON export

Click **Export JSON** to download all visible log entries as a `.json` file.

## Schema & Try page

A split-panel view of your endpoints with interactive documentation and a built-in HTTP client.

### Endpoint list

All discovered endpoints are listed on the left with method badges and paths. Click any endpoint to open its detail view.

### Documentation tab

For the selected endpoint:

- **Title and description** (if set on the `EndpointDefinition`)
- **Method, path, and auth type** header
- **Path parameters** table (name, type, required)
- **Request body** table — shows every field from the `validator` with its type, required/optional status, and constraints (min/max length, format)
- **Responses** section — expected status codes (200/201, 401 for secure, 422 when validator present)

To make schema documentation richer, add `title` and `description` to your endpoints:

```ts
export const createPost: EndpointDefinition = {
  path: "/api/posts",
  method: "POST",
  type: "secure",
  title: "Create Post",
  description: "Creates a new post and returns it with a generated ID.",
  validator: {
    title: z.string().min(3),
    body:  z.string().min(10),
  },
  handler: (req) => {
    req.errors.throwValidationError();
    return AppResponse.created({ data: makePost() });
  },
};
```

### Try it tab

Send a real HTTP request directly from the console:

1. Select an endpoint from the left list
2. Fill in **path parameters** (`:id` fields get their own inputs)
3. Add optional **query parameters**
4. Edit the **request body** — pre-filled with field names from the `validator` if present
5. Click **Send**

The response status and body appear below the form. All requests go through the full SimAPI pipeline — auth, validation, fake data — exactly as a real client would.

## Configuration

The console respects your `simapi.config.ts` settings. To disable request logging while keeping the console mounted:

```ts
export default defineConfig({
  name: "my-api",
  logEntries: false,   // don't write to DB
  // @simapi/console still mounts; Logs page will be empty
});
```

To run without the console even when it's installed:

```sh
npx simapi console:remove
```
