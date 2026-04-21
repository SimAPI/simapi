import { AuthHandlers, defineConfig } from "@simapi/simapi";

export default defineConfig({
  name: "SimAPI Shop Sample",
  description:
    "A realistic e-commerce store API — products, cart, orders, reviews and customer accounts.",
  port: 3002,
  logEntries: true,
  consoleLog: true,
  authHandler: AuthHandlers.bearer(),
  autoThrowValidationErrors: "laravel",
  database: {
    type: "sqlite",
    path: "./.simapi/db.sqlite",
  },
});
