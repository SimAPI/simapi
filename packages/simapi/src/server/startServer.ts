import { serve } from "@hono/node-server";
import type { Hono } from "hono";

export function startServer(app: Hono, port: number): void {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`\n  SimAPI running at http://localhost:${info.port}\n`);
  });
}
