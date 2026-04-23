import { serve } from "@hono/node-server";
import { consola } from "consola";
import type { Hono } from "hono";

export function startServer(
  app: Hono,
  port: number,
  onStart?: (port: number) => void
): ReturnType<typeof serve> {
  const envPort = Number(process.env.PORT);
  const basePort =
    Number.isInteger(envPort) && envPort >= 1 && envPort <= 65535
      ? envPort
      : port;

  return tryPort(app, basePort, 10, onStart);
}

function tryPort(
  app: Hono,
  port: number,
  attemptsLeft: number,
  onStart?: (port: number) => void
): ReturnType<typeof serve> {
  const server = serve({ fetch: app.fetch, port }, (info) => {
    consola.success(`SimAPI running at http://localhost:${info.port}`);
    onStart?.(info.port);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && attemptsLeft > 1) {
      consola.warn(`Port ${port} in use, trying ${port + 1}…`);
      tryPort(app, port + 1, attemptsLeft - 1, onStart);
    } else {
      throw err;
    }
  });

  return server;
}
