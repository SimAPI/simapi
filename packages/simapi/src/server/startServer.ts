import { serve } from "@hono/node-server";
import type { Hono } from "hono";

export function startServer(app: Hono, port: number): void {
  const envPort = Number(process.env.PORT);
  const basePort =
    Number.isInteger(envPort) && envPort >= 1 && envPort <= 65535
      ? envPort
      : port;

  tryPort(app, basePort, 10);
}

function tryPort(app: Hono, port: number, attemptsLeft: number): void {
  const server = serve({ fetch: app.fetch, port }, (info) => {
    console.log(`\n  SimAPI running at http://localhost:${info.port}\n`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && attemptsLeft > 1) {
      console.log(`[SimAPI] Port ${port} in use, trying ${port + 1}…`);
      tryPort(app, port + 1, attemptsLeft - 1);
    } else {
      throw err;
    }
  });
}
