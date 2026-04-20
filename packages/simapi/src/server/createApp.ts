import type { Context } from "hono";
import { Hono } from "hono";

import { AppRequest } from "../core/AppRequest.js";
import { AppResponse } from "../core/AppResponse.js";
import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";
import { ValidationError } from "../core/ValidationErrors.js";
import type { DbAdapter } from "../db/types.js";
import { discoverEndpoints } from "./discovery.js";

interface ParsedRequest {
  request: AppRequest;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  query: Record<string, string>;
}

export async function createApp(
  config: SimAPIConfig,
  endpointsDir: string,
  adapter?: DbAdapter
): Promise<Hono> {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof ValidationError) {
      return c.json(formatValidationError(err), 422);
    }
    console.error("[SimAPI] Unhandled error:", err);
    return c.json({ message: "Internal server error" }, 500);
  });

  const endpoints = await discoverEndpoints(endpointsDir);
  console.log(
    `[SimAPI] Loaded ${endpoints.length} endpoint(s) from ${endpointsDir}`
  );

  for (const endpoint of endpoints) {
    registerEndpoint(app, endpoint, config, adapter);
  }

  return app;
}

function registerEndpoint(
  app: Hono,
  endpoint: EndpointDefinition,
  config: SimAPIConfig,
  adapter: DbAdapter | undefined
): void {
  app.on(endpoint.method, endpoint.path, async (c: Context) => {
    const start = Date.now();
    const parsed = await buildRequest(c);

    let logStatus = 500;
    let logBody: unknown = {};

    try {
      if (endpoint.type === "secure") {
        if (!config.authHandler) {
          logStatus = 500;
          logBody = {
            message: "Endpoint is secure but no authHandler is configured.",
          };
          return c.json(logBody, 500);
        }
        const authResult = config.authHandler(parsed.request);
        if (authResult instanceof AppResponse) {
          logStatus = authResult.status;
          logBody = authResult.body;
          // biome-ignore lint/suspicious/noExplicitAny: status is a valid HTTP code
          return c.json(authResult.body, authResult.status as any);
        }
      }

      const response = await endpoint.handler(parsed.request);
      logStatus = response.status;
      logBody = response.body;
      // biome-ignore lint/suspicious/noExplicitAny: status is a valid HTTP code
      return c.json(response.body, response.status as any);
    } catch (err) {
      if (err instanceof ValidationError) {
        logStatus = 422;
        logBody = formatValidationError(err);
      }
      throw err;
    } finally {
      if (adapter && config.logEntries !== false) {
        adapter
          .log({
            method: endpoint.method,
            path: c.req.path,
            query: JSON.stringify(parsed.query),
            requestHeaders: JSON.stringify(parsed.headers),
            requestBody: JSON.stringify(parsed.body),
            responseStatus: logStatus,
            responseBody: JSON.stringify(logBody),
            durationMs: Date.now() - start,
            timestamp: new Date().toISOString(),
          })
          .catch((err) => console.error("[SimAPI] log error:", err));
      }
    }
  });
}

async function buildRequest(c: Context): Promise<ParsedRequest> {
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body: Record<string, unknown> = {};
  const contentType = c.req.header("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await c.req.formData().catch(() => null);
    if (form) {
      form.forEach((value, key) => {
        body[key] = value;
      });
    }
  }

  const query: Record<string, string> = {};
  new URL(c.req.url).searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const urlParams = c.req.param() as Record<string, string>;

  return {
    request: new AppRequest(headers, body, query, urlParams),
    headers,
    body,
    query,
  };
}

function formatValidationError(err: ValidationError): unknown {
  if (err.format === "laravel") {
    return {
      message: "The given data was invalid.",
      errors: err.errorBag,
    };
  }
  return {
    issues: Object.entries(err.errorBag).flatMap(([field, messages]) =>
      messages.map((message) => ({ path: [field], message }))
    ),
  };
}
