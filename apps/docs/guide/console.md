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

The console is only mounted when `@simapi/console` is installed. It is served alongside your endpoints — no separate server needed.

## Overview tab

The landing page shows the health of your running server:

| Field | Description |
|---|---|
| **Status** | `running` when the server is reachable |
| **Name** | Value of `name` from `simapi.config.ts` |
| **Version** | SimAPI package version |
| **Endpoints** | Total number of discovered endpoints |
| **Uptime** | Time since the server started |

## Logs tab

Every request logged to your database appears here in real time.

### Live stream

A Server-Sent Events connection keeps the log table updating as requests arrive. New rows slide in at the top without a page refresh.

### Log columns

| Column | Description |
|---|---|
| **Method** | HTTP method badge (color-coded) |
| **Path** | The matched route path |
| **Status** | Response status code (green 2xx, yellow 4xx, red 5xx) |
| **Duration** | Time from request received to response sent |
| **Time** | Timestamp of the request |

### Filtering

Use the filter bar to narrow results by method, status code range, or path substring. Filters apply to both the live stream and paginated history.

### JSON export

Click **Export** to download the visible log entries as a `.json` file — useful for sharing reproduction cases or feeding into other tools.

## Schema tab

A full list of every endpoint SimAPI has loaded, including:

- **Method badge** — GET, POST, PUT, PATCH, DELETE with distinct colors
- **Path** — the full route pattern
- **Type badge** — `open` or `secure`
- **Validator** — shown when the endpoint has a `validator` field

### OpenAPI export

Click **Export OpenAPI** to download an `openapi.yaml` spec generated from your live endpoints. Equivalent to running `simapi export` from the CLI.

## Try tab

Send a real HTTP request to any endpoint directly from the console.

1. **Select an endpoint** from the dropdown — path and method are filled in automatically.
2. **Fill path params** — if the route has `:id` segments, input fields appear for each one.
3. **Fill query params** — add any `?key=value` pairs.
4. **Fill request body** — a JSON editor appears for POST/PUT/PATCH endpoints. If the endpoint has a `validator`, the expected fields are shown as placeholders.
5. **Add headers** — include `Authorization` or any custom header.
6. Click **Send** — the response status, body, and duration appear below.

All requests fired from the Try tab go through your full SimAPI pipeline — auth handlers, validators, fake data — exactly as a real client would experience them.

## Configuration

The console respects your `simapi.config.ts` settings. To disable request logging while keeping the console mounted:

```ts
export default defineConfig({
  name: "my-api",
  logEntries: false,   // don't write to DB
  // @simapi/console still mounts; Logs tab will be empty
});
```

To run without the console even when it's installed, remove the package:

```sh
npx simapi console:remove
```
