import type { Hono } from "hono";
import { streamSSE } from "hono/streaming";

import { AppRequest } from "../core/AppRequest.js";
import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";
import { ValidationErrors } from "../core/ValidationErrors.js";
import type { RequestLogEntry } from "../db/types.js";
import type { LogBus } from "./logBus.js";
import { zodShapeToJsonSchema } from "./zodSchema.js";

const SIMAPI_VERSION = "0.1.0";

async function getResponseExample(
  endpoint: EndpointDefinition
): Promise<unknown> {
  try {
    const mockReq = new AppRequest({}, {}, {}, {}, new ValidationErrors({}));
    const result = await endpoint.handler(mockReq);
    return result.body;
  } catch {
    return undefined;
  }
}

export async function registerInternalRoutes(
  app: Hono,
  endpoints: EndpointDefinition[],
  config: SimAPIConfig,
  bus: LogBus
): Promise<void> {
  // Pre-compute endpoint info (including response examples) once at startup
  const endpointInfos = await Promise.all(
    endpoints.map(async (e) => ({
      method: e.method,
      path: e.path,
      type: e.type,
      title: e.title,
      description: e.description,
      schema: e.validator
        ? zodShapeToJsonSchema(e.validator as Record<string, unknown>)
        : undefined,
      responseExample: await getResponseExample(e),
    }))
  );

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
    return c.json(endpointInfos);
  });

  app.get("/__simapi/logs", async (c) => {
    const limit = Math.min(Number(c.req.query("limit") ?? "100"), 500);
    const offset = Number(c.req.query("offset") ?? "0");
    const data = await bus.getLogs({ limit, offset });
    return c.json({ data, limit, offset });
  });

  app.delete("/__simapi/logs", async (c) => {
    await bus.clearLogs();
    return c.json({ ok: true });
  });

  app.delete("/__simapi/logs/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ error: "Invalid id" }, 400);
    }
    await bus.deleteLog(id);
    return c.json({ ok: true });
  });

  app.get("/__simapi/logs/stream", (c) => {
    return streamSSE(c, async (stream) => {
      const onEntry = (entry: RequestLogEntry) => {
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
