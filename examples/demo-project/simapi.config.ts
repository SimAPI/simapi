import { defineConfig } from "simapi";

export default defineConfig({
  name: "simapi-demo",
  description: "Demo project — posts API",
  port: 3000,
  logEntries: true,
  consoleLog: true,
  database: {
    type: "sqlite",
    path: "./.simapi/db.sqlite",
  },
});
