import type { Context } from "hono";
import { Hono } from "hono";

import { AppRequest } from "../core/AppRequest.js";
import { AppResponse } from "../core/AppResponse.js";
import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";
import { ValidationError } from "../core/ValidationErrors.js";
import { discoverEndpoints } from "./discovery.js";

export async function createApp(
  config: SimAPIConfig,
  endpointsDir: string
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
    registerEndpoint(app, endpoint, config);
  }

  return app;
}

function registerEndpoint(
  app: Hono,
  endpoint: EndpointDefinition,
  config: SimAPIConfig
): void {
  app.on(endpoint.method, endpoint.path, async (c: Context) => {
    const req = await buildRequest(c);

    if (endpoint.type === "secure") {
      if (!config.authHandler) {
        return c.json(
          { message: "Endpoint is secure but no authHandler is configured." },
          500
        );
      }
      const authResult = config.authHandler(req);
      if (authResult instanceof AppResponse) {
        // biome-ignore lint/suspicious/noExplicitAny: status is a valid HTTP code
        return c.json(authResult.body, authResult.status as any);
      }
    }

    const response = await endpoint.handler(req);
    // biome-ignore lint/suspicious/noExplicitAny: status is a valid HTTP code
    return c.json(response.body, response.status as any);
  });
}

async function buildRequest(c: Context): Promise<AppRequest> {
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

  const queryParams: Record<string, string> = {};
  new URL(c.req.url).searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const urlParams = c.req.param() as Record<string, string>;

  return new AppRequest(headers, body, queryParams, urlParams);
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
