# Deployment

SimAPI mock servers are designed to be deployed to staging environments so your whole team can develop against the same API — even before the real backend exists.

## Build for production

```sh
npm run build   # compiles to .simapi/dist/server.mjs
npm run start   # runs with plain node — no tsx, no TypeScript
```

The server reads the `PORT` environment variable, falling back to the port in `simapi.config.ts`.

---

## Vercel (recommended for lightweight deployments)

Vercel is the recommended choice for lightweight SimAPI deployments. It offers instant Git-based deploys, a generous free tier, and automatic HTTPS — ideal for sharing a mock API with your team during active frontend development.

SimAPI is built on [Hono](https://hono.dev), which has first-class Vercel support.

### Deploy steps

1. Push your project to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Set the following in the project settings:

   | Setting | Value |
   |---|---|
   | **Framework Preset** | Other |
   | **Build Command** | `npm run build` |
   | **Output Directory** | *(leave blank)* |
   | **Install Command** | `npm install` |
   | **Start Command** | `npm run start` |

4. Click **Deploy**. Your mock API is live at `https://your-project.vercel.app`.

### Environment variables

Set any needed variables (e.g. `DATABASE_URL`) in **Project Settings → Environment Variables**.

---

## Netlify

Netlify is a solid alternative for teams already using it for frontend hosting.

1. Push your project to GitHub.
2. Go to [netlify.com](https://netlify.com) → **Add new site** → import from Git.
3. Add a `netlify.toml` at the project root:

```toml
[build]
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"
```

4. Set the start command to `npm run start` under **Site settings → Build & deploy → Continuous deployment**.
5. Add environment variables under **Site settings → Environment variables**.

---

## Railway

Railway is the most reliable option for persistent deployments with zero configuration.

1. Push your project to GitHub.
2. Create a new Railway project and connect the repo.
3. Railway auto-detects Node.js and runs `npm start` after `npm install`.
4. Set any environment variables in the Railway dashboard.
5. Your mock API is live at `https://your-project.railway.app`.

**With a Dockerfile** (if you selected it during `create-simapi`):

Railway uses the Dockerfile automatically:

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

---

## Other hosts

SimAPI runs anywhere Node.js 20+ is available:

| Host | Notes |
|---|---|
| **Render** | Web Service — build: `npm run build`, start: `npm run start` |
| **Fly.io** | `fly launch` with the included Dockerfile |
| **Heroku** | Add a `Procfile`: `web: npm run start` |
| **VPS / Docker** | `docker build` + `docker run -p 3000:3000` |

---

## Environment variables

| Variable | Effect |
|---|---|
| `PORT` | Overrides the port from `simapi.config.ts` |
| `DATABASE_URL` | Used if referenced in your config for Postgres logging |
| `TURSO_TOKEN` | Used if referenced in your config for libSQL/Turso |
