# Railway

Railway is the most reliable option for persistent SimAPI deployments. It runs your server as a **long-lived Node.js process** — exactly like running locally — so all SimAPI features work without modification.

> ℹ️ Node.js server
> Railway runs `npm run start` after `npm run build`. SQLite logging persists across requests and the debug console works fully.

## Deploy steps

1. Push your project to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select your repo.
3. Railway auto-detects Node.js. It runs `npm install` then `npm run build` then `npm run start`.
4. Add environment variables in the Railway dashboard under **Variables**.

Your mock API is live at `https://your-project.up.railway.app` (or a custom domain).

## With a Dockerfile

If you included a Dockerfile (via `simapi init` or `simapi setup docker`), Railway uses it automatically:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Railway detects the `Dockerfile` in your repo and builds the image instead of using the Nixpacks auto-detect.

## Environment variables

| Variable                  | Effect                                                                       |
| ------------------------- | ---------------------------------------------------------------------------- |
| `PORT`                    | Overrides the port from `simapi.config.ts` — Railway sets this automatically |
| `SIMAPI_CONSOLE_USERNAME` | HTTP Basic Auth username for `/__simapi/*`                                   |
| `SIMAPI_CONSOLE_PASSWORD` | HTTP Basic Auth password for `/__simapi/*`                                   |
| `DATABASE_URL`            | Postgres connection URL (if using Postgres logging)                          |
| `TURSO_TOKEN`             | Auth token for libSQL/Turso logging                                          |

> ℹ️ PORT is set automatically
> Railway injects `PORT` into your environment. SimAPI reads it automatically — no changes to `simapi.config.ts` needed.
