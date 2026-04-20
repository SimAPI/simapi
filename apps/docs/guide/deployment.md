# Deployment

SimAPI mock servers are designed to be deployed to staging environments so your whole team can develop against the same API — even before the real backend exists.

## Build & start

```sh
# Compile TypeScript to a single Node.js bundle
npm run build

# Start the compiled server
npm run start
```

`npm run build` outputs `.simapi/dist/server.mjs`. `npm run start` runs it with plain `node` (no `tsx`, no TypeScript).

The server reads the `PORT` environment variable, falling back to the port in `simapi.config.ts`.

## Railway (recommended)

Railway is the canonical deployment target for SimAPI — zero config, free tier, instant deploys.

**Steps:**

1. Push your project to GitHub.

2. Create a new Railway project and connect the repo.

3. Railway auto-detects Node.js and runs `npm start` after `npm install`.

4. Set environment variables in the Railway dashboard if needed (e.g. `DATABASE_URL` for Postgres logging).

5. Your mock API is live at `https://your-project.railway.app`.

**With a Dockerfile** (if you selected it during `create-simapi`):

Railway uses the Dockerfile automatically. The default Dockerfile runs `npm run build` then `npm run start`.

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

## Other hosts

SimAPI runs anywhere Node.js 20+ is available:

| Host | Notes |
|---|---|
| **Render** | Add a Web Service, set build command to `npm run build`, start command to `npm run start` |
| **Fly.io** | Use the included Dockerfile with `fly launch` |
| **Heroku** | Add a `Procfile`: `web: npm run start` |
| **VPS / Docker** | Build with `docker build`, run with `-p 3000:3000 -e PORT=3000` |

## Environment variables

| Variable | Effect |
|---|---|
| `PORT` | Overrides the port from `simapi.config.ts` |
| `DATABASE_URL` | Used if you reference it in your config |
| `TURSO_TOKEN` | Used if you reference it in your config |
