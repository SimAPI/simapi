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
    "build": "simapi build",
    "start": "simapi start",
    "import": "simapi import",
    "export": "simapi export"
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
    "skipLibCheck": true
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
import { authHandler } from "./authHandler.js";

export default defineConfig({
  name: "{{name}}",
  description: "{{description}}",
  port: 3000,
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

export const DOCKERFILE = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
`;

// ─── endpoint template ────────────────────────────────────────────────────────

export const ENDPOINT_TS = `import { AppResponse, type AppRequest } from "@simapi/simapi";

export const {{handlerName}} = {
  path: "{{path}}",
  method: "{{method}}",
  type: "{{authType}}",
  handler: (_req: AppRequest) => {
    return AppResponse.success({
      message: "{{message}}",
      data: {},
    });
  },
};
`;
