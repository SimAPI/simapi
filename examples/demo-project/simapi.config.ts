import { AuthHandlers, defineConfig } from "@simapi/simapi";

export default defineConfig({
  name: "simapi-demo",
  description: "Demo project — posts API",
  port: 3000,
  endpointsDir: "src/endpoints",
  logEntries: true,
  consoleLog: true,
  authHandler: AuthHandlers.bearer(),
  database: {
    type: "sqlite",
    path: "./.simapi/db.sqlite",
  },
});
