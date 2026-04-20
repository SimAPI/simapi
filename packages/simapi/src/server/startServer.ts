import { serve } from "@hono/node-server";
import type { Hono } from "hono";

export function startServer(app: Hono, port: number): void {
  const resolvedPort = Number(process.env.PORT ?? port);
  serve({ fetch: app.fetch, port: resolvedPort }, (info) => {
    console.log(`\n  SimAPI running at http://localhost:${info.port}\n`);
  });
}
