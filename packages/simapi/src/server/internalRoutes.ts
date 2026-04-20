import type { Hono } from "hono";
import { streamSSE } from "hono/streaming";

import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";
import type { RequestLogEntry } from "../db/types.js";
import type { LogBus } from "./logBus.js";

const SIMAPI_VERSION = "0.1.0";

export function registerInternalRoutes(
  app: Hono,
  endpoints: EndpointDefinition[],
  config: SimAPIConfig,
  bus: LogBus
): void {
  app.get("/__simapi/health", (c) => {
    return c.json({
      ok: true,
      version: SIMAPI_VERSION,
      name: config.name,
      endpointCount: endpoints.length,
      logging: config.logEntries !== false,
    });
  });

  app.get("/__simapi/endpoints", (c) => {
    return c.json(
      endpoints.map((e) => ({ method: e.method, path: e.path, type: e.type }))
    );
  });

  app.get("/__simapi/logs", async (c) => {
    const limit = Math.min(Number(c.req.query("limit") ?? "100"), 500);
    const offset = Number(c.req.query("offset") ?? "0");
    const data = await bus.getLogs({ limit, offset });
    return c.json({ data, limit, offset });
  });

  app.get("/__simapi/logs/stream", (c) => {
    return streamSSE(c, async (stream) => {
      const onEntry = (entry: Omit<RequestLogEntry, "id">) => {
        stream
          .writeSSE({ data: JSON.stringify(entry), event: "log" })
          .catch(() => {});
      };

      bus.on("entry", onEntry);

      const heartbeat = setInterval(() => {
        stream.writeSSE({ data: "", event: "heartbeat" }).catch(() => {});
      }, 30_000);

      await new Promise<void>((resolve) => {
        stream.onAbort(() => {
          clearInterval(heartbeat);
          bus.off("entry", onEntry);
          resolve();
        });
      });
    });
  });
}
