# Netlify

Netlify is a solid option for teams already using it for frontend hosting. Like Vercel, it is a serverless platform — SimAPI **auto-detects Netlify's build environment** and compiles a Netlify Function (`netlify/functions/api.mjs`) instead of a long-running Node.js server.

> 🚧 Serverless platform
> Netlify does **not** run a persistent Node.js process. SQLite does not persist between requests (ephemeral filesystem).
>
> Set `logEntries: false` in `simapi.config.ts`, or switch to [Turso](https://turso.tech) for persistent request logging.

## Setup

Run `simapi setup netlify` in your project root to generate `netlify.toml`:

```bash
simapi setup netlify
```

This creates:

```toml
[build]
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/api"
  status = 200
  force = true
```

The `[[redirects]]` rule proxies all incoming requests to the Netlify Function that SimAPI generates at build time.

## Deploy steps

1. Run `simapi setup netlify` to add `netlify.toml`.
2. Push your project to GitHub.
3. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project** → connect your repo.
4. Netlify detects `netlify.toml` automatically — no manual build settings needed.
5. Add environment variables under **Site settings → Environment variables**.
6. Click **Deploy site**.

When Netlify runs the build it sets `NETLIFY=true` in the environment. SimAPI detects this and outputs `netlify/functions/api.mjs` — a [Netlify Functions](https://docs.netlify.com/functions/overview/) handler that receives all proxied requests and routes them through your mock API.

> ℹ️ netlify/functions/api.mjs is a build artifact
> `netlify/functions/api.mjs` is generated during the Netlify build — it is **not** to be committed to your repository. The `.gitignore` that `simapi init` creates already excludes it.

## Environment variables

Set variables in **Site settings → Environment variables**.

| Variable | Effect |
|---|---|
| `SIMAPI_CONSOLE_USERNAME` | HTTP Basic Auth username for `/__simapi/*` |
| `SIMAPI_CONSOLE_PASSWORD` | HTTP Basic Auth password for `/__simapi/*` |
| `DATABASE_URL` | Postgres connection URL (if using Postgres logging) |
| `TURSO_TOKEN` | Auth token for libSQL/Turso logging |

## Local testing

To generate the Netlify function output locally, pass `--platform netlify` explicitly:

```sh
npx @simapi/simapi build --platform netlify
```

This outputs `netlify/functions/api.mjs` without needing the Netlify CI environment.
