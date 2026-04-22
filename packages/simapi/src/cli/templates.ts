/** Fill {{key}} placeholders in a template string. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

// ─── init templates ──────────────────────────────────────────────────────────

export const PACKAGE_JSON = `{
  "name": "{{name}}",
  "version": "0.1.0",
  "type": "module",
  "description": "{{description}}",
  "scripts": {
    "serve": "simapi serve",
    "dev": "simapi dev",
    "build:netlify": "simapi build --platform netlify",
    "build:node": "simapi build --platform node",
    "build:vercel": "simapi build --platform vercel",
    "start": "simapi start",
    "simapi": "simapi interactive"
  },
  "dependencies": {}
}
`;

export const TSCONFIG_JSON = `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
`;

export const GITIGNORE = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# Dependencies
node_modules
.pnp
.pnp.js

# env files
.env
.env.*
!.env.example

# SimAPI runtime
.simapi

# Vercel
.vercel

# SimAPI serverless build outputs (generated during platform CI builds)
/api/index.mjs
/netlify/functions/api.mjs

# Build Outputs
out/
build
dist

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.DS_Store
*.pem
`;

export const ENV_EXAMPLE = `# Console authentication — set both to protect /__simapi/* with HTTP Basic Auth.
# Leave empty to allow unauthenticated access (default for local dev).
SIMAPI_CONSOLE_USERNAME=
SIMAPI_CONSOLE_PASSWORD=
`;

export const SIMAPI_CONFIG_TS = `import { defineConfig } from "@simapi/simapi";

export default defineConfig({
  name: "{{name}}",
  description: "{{description}}",
  port: 3000,
  endpointsDir: "src/endpoints",
  // authHandler: AuthHandlers.bearer(),
  logEntries: true,
  consoleLog: true,
  database: {
    type: "sqlite",
    path: "./.simapi/db.sqlite",
  },
});
`;

export const SIMAPI_CONFIG_WITH_AUTH_TS = `import { defineConfig } from "@simapi/simapi";
import { authHandler } from "./src/authHandler.js";

export default defineConfig({
  name: "{{name}}",
  description: "{{description}}",
  port: 3000,
  endpointsDir: "src/endpoints",
  authHandler,
  logEntries: true,
  consoleLog: true,
  database: {
    type: "sqlite",
    path: "./.simapi/db.sqlite",
  },
});
`;

export const AUTH_HANDLER_TS = `import { AppResponse, type AppRequest } from "@simapi/simapi";

export function authHandler(req: AppRequest) {
  const token = req.header("Authorization");

  if (!token) {
    return AppResponse.unauthenticated({ message: "Missing Authorization header" });
  }

  // Return nothing to let the request proceed.
}
`;

export const VERCEL_JSON = `{
  "version": 2,
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
`;

export const NETLIFY_TOML = `[build]
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/api"
  status = 200
  force = true
`;

export const DOCKERFILE = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
`;

// ─── starter files ───────────────────────────────────────────────────────────

export const USER_MODEL_TS = `import { faker } from "@simapi/simapi";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "guest";
  createdAt: string;
}

export function makeUser(): User {
  return {
    id: faker.string.ulid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(["admin", "member", "guest"] as const),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
  };
}
`;

export const HELLO_WORLD_REQUEST_TS = `import { z } from "@simapi/simapi";

export const helloWorldRequest = {
  body: {
    name: z.string().min(2).max(100).default("John Doe"),
  },
};
`;

export const HELLO_WORLD_TS = `import { AppResponse, type AppRequest, type EndpointDefinition } from "@simapi/simapi";

import { makeUser } from "@/models/user.js";
import { helloWorldRequest } from "@/requests/hello-world.js";

export const helloGet: EndpointDefinition = {
  path: "/",
  method: "GET",
  type: "open",
  title: "Hello World",
  description: "Returns a greeting. No authentication required.",
  handler: (req: AppRequest) => {
    return AppResponse.success({ message: "Hello, World!" });
  },
};

export const helloPost: EndpointDefinition = {
  path: "/",
  method: "POST",
  type: "secure",
  title: "Hello (Authenticated)",
  description: "Returns a greeting with a sample user. Requires authentication.",
  request: helloWorldRequest,
  handler: (req: AppRequest) => {
    const name = req.body<string>("name");

    return AppResponse.created({
      message: \`Hello \${name} from behind the wall!\`,
      user: makeUser(),
    });
  },
};
`;
