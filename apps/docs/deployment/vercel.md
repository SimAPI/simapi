# Vercel

Vercel is a great choice for lightweight SimAPI deployments — free tier, instant Git-based deploys, and automatic HTTPS. Ideal for sharing a mock API with your team during active frontend development.

SimAPI is built on [Hono](https://hono.dev) and **auto-detects Vercel's build environment**, compiling to a serverless handler (`api/index.mjs`) instead of a long-running Node.js server.

> [!WARNING] Serverless platform
> Vercel does **not** run a persistent Node.js process. There is no "Start Command". SQLite does not persist between requests (ephemeral filesystem).
>
> Set `logEntries: false` in `simapi.config.ts`, or switch to [Turso](https://turso.tech) for persistent request logging.

## Setup

Run `simapi setup vercel` in your project root to generate `vercel.json`:

```bash
simapi setup vercel
```

This creates:

```json
{
  "version": 2,
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

The `rewrites` rule routes all incoming requests to `api/index.mjs` — the serverless function that SimAPI generates at build time when it detects `VERCEL=1` in the environment.

## Deploy steps

1. Run `simapi setup vercel` to add `vercel.json`.
2. Push your project to GitHub.
3. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
4. Configure the project settings:

    | Setting              | Value           |
    | -------------------- | --------------- |
    | **Framework Preset** | Other           |
    | **Build Command**    | `npm run build` |
    | **Output Directory** | *(leave blank)* |
    | **Install Command**  | `npm install`   |
    | **Start Command**    | *(leave blank)* |

5. Click **Deploy**. Your mock API is live at `https://your-project.vercel.app`.

When Vercel runs the build it sets `VERCEL=1` in the environment. SimAPI detects this and outputs `api/index.mjs` (a Vercel-compatible serverless handler) instead of the default `.simapi/dist/server.mjs`.

> [!INFO] api/index.mjs is a build artifact
> `api/index.mjs` is generated during the Vercel build — it is **not** committed to your repository. The `.gitignore` that `simapi init` creates already excludes it.

## Environment variables

Set variables in **Project Settings → Environment Variables**.

| Variable                  | Effect                                              |
| ------------------------- | --------------------------------------------------- |
| `SIMAPI_CONSOLE_USERNAME` | HTTP Basic Auth username for `/__simapi/*`          |
| `SIMAPI_CONSOLE_PASSWORD` | HTTP Basic Auth password for `/__simapi/*`          |
| `DATABASE_URL`            | Postgres connection URL (if using Postgres logging) |
| `TURSO_TOKEN`             | Auth token for libSQL/Turso logging                 |

## Local testing

To generate the Vercel function output locally, pass `--platform vercel` explicitly:

```sh
npx @simapi/simapi build --platform vercel
```

This outputs `api/index.mjs` without needing the Vercel CI environment.
