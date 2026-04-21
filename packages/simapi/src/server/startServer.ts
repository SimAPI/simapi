import { serve } from "@hono/node-server";
import type { Hono } from "hono";

export function startServer(app: Hono, port: number): void {
  const envPort = Number(process.env.PORT);

  const resolvedPort =
    Number.isInteger(envPort) && envPort >= 1 && envPort <= 65535
      ? envPort
      : port;

  serve({ fetch: app.fetch, port: resolvedPort }, (info) => {
    console.log(`\n  SimAPI running at http://localhost:${info.port}\n`);
  });
}
