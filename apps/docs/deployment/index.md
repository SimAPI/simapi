# Deployment

SimAPI mock servers can be deployed to any staging environment so your whole team develops against the same API — before the real backend exists.

## Build for production

```sh
npm run build   # compiles to .simapi/dist/server.mjs
npm run start   # runs with plain node — no tsx, no TypeScript
```

The server reads the `PORT` environment variable, falling back to the port in `simapi.config.ts`.

## Setting up a platform

Use `simapi setup` to generate the right configuration file for your target platform:

```sh
simapi setup vercel    # creates vercel.json
simapi setup netlify   # creates netlify.toml
```

## Securing the console

When deployed, protect the `/__simapi/*` endpoints by setting these environment variables on your host:

```
SIMAPI_CONSOLE_USERNAME=admin
SIMAPI_CONSOLE_PASSWORD=a-strong-password
```

SimAPI applies HTTP Basic Auth to all `/__simapi/*` routes — including the debug console, logs API, and OpenAPI endpoints. Requests without valid credentials receive a `401` response.

Leave these unset in local development — no auth is applied.

## Choose a platform

| Platform                               | Type           | Best for                               |
| -------------------------------------- | -------------- | -------------------------------------- |
| [Vercel](/deployment/vercel)           | Serverless     | Free tier, instant Git deploys         |
| [Netlify](/deployment/netlify)         | Serverless     | Teams already on Netlify               |
| [Railway](/deployment/railway)         | Node.js server | Persistent deployments, SQLite logging |
| [Other hosts](/deployment/other-hosts) | Node.js server | Render, Fly.io, Heroku, VPS, Docker    |

> ℹ️ Serverless vs. Node.js server
> - **Vercel and Netlify** are serverless - each request invokes a function. SQLite does not persist between invocations (ephemeral filesystem), so set `logEntries: false` in `simapi.config.ts` or use [Turso](https://turso.tech) for cloud SQLite logging.
> - **Railway and other Node.js hosts** run a long-lived server process. SQLite and all SimAPI features work without modification.

## Environment variables

| Variable                  | Effect                                                     |
| ------------------------- | ---------------------------------------------------------- |
| `PORT`                    | Overrides the port from `simapi.config.ts` (Node.js hosts) |
| `SIMAPI_CONSOLE_USERNAME` | HTTP Basic Auth username for `/__simapi/*`                 |
| `SIMAPI_CONSOLE_PASSWORD` | HTTP Basic Auth password for `/__simapi/*`                 |
| `DATABASE_URL`            | Postgres connection URL (if using Postgres logging)        |
| `TURSO_TOKEN`             | Auth token for libSQL/Turso logging                        |
