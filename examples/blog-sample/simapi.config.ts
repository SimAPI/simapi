import { AuthHandlers, defineConfig } from "@simapi/simapi";

export default defineConfig({
  name: "SimAPI Blog Sample",
  description:
    "A realistic blog platform API — posts, authors, comments, categories, tags, media and analytics.",
  port: 3001,
  endpointsDir: "src/endpoints",
  logEntries: true,
  consoleLog: true,
  authHandler: AuthHandlers.bearer(),
  autoThrowValidationErrors: "laravel",
  database: {
    type: "sqlite",
    path: "./.simapi/db.sqlite",
  },
});
