import type { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { streamSSE } from "hono/streaming";
import { stringify as yamlStringify } from "yaml";

import { AppRequest } from "../core/AppRequest.js";
import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";
import { ValidationErrors } from "../core/ValidationErrors.js";
import type { RequestLogEntry } from "../db/types.js";
import type { LogBus } from "./logBus.js";
import { buildOpenApiSpec } from "./openapi.js";
import { zodShapeToJsonSchema } from "./zodSchema.js";

declare const __SIMAPI_VERSION__: string;

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
  const consoleUser = process.env.SIMAPI_CONSOLE_USERNAME;
  const consolePass = process.env.SIMAPI_CONSOLE_PASSWORD;
  if (consoleUser && consolePass) {
    app.use(
      "/__simapi/*",
      basicAuth({ username: consoleUser, password: consolePass })
    );
  }

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
      version: __SIMAPI_VERSION__,
      name: config.name,
      endpointCount: endpoints.length,
      logging: config.logEntries !== false,
    });
  });

  app.get("/__simapi/openapi.json", async (c) => {
    const spec = await buildOpenApiSpec(endpoints, config);

    return c.json(spec);
  });

  app.get("/__simapi/openapi.yaml", async (_c) => {
    const spec = await buildOpenApiSpec(endpoints, config);

    return new Response(yamlStringify(spec, { lineWidth: 120 }), {
      headers: { "content-type": "text/yaml; charset=utf-8" },
    });
  });

  app.get("/__simapi/endpoints", (c) => {
    return c.json(endpointInfos);
  });

  app.get("/__simapi/logs", async (c) => {
    const rawLimit = Number(c.req.query("limit"));
    const rawOffset = Number(c.req.query("offset"));
    const limit = Math.min(
      Number.isFinite(rawLimit) && rawLimit >= 0 ? Math.floor(rawLimit) : 100,
      500
    );
    const offset =
      Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.floor(rawOffset) : 0;

    const data = await bus.getLogs({ limit, offset });

    return c.json({ data, limit, offset });
  });

  app.delete("/__simapi/logs", async (c) => {
    await bus.clearLogs();

    return c.json({ ok: true });
  });

  app.delete("/__simapi/logs/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (!Number.isInteger(id) || id <= 0)
      return c.json({ error: "Invalid id" }, 400);

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
