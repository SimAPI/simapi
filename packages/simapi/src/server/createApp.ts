import { consola } from "consola";
import type { Context } from "hono";
import { Hono } from "hono";
import { type ZodRawShape, z } from "zod";

import { AppRequest } from "../core/AppRequest.js";
import { AppResponse } from "../core/AppResponse.js";
import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";
import { ValidationError, ValidationErrors } from "../core/ValidationErrors.js";
import { discoverEndpoints } from "./discovery.js";
import { registerInternalRoutes } from "./internalRoutes.js";
import type { LogBus } from "./logBus.js";

interface RawRequest {
  headers: Record<string, string>;
  body: Record<string, unknown>;
  form: Record<string, unknown>;
  query: Record<string, string>;
  urlParams: Record<string, string>;
}

export async function createApp(
  config: SimAPIConfig,
  endpointsDir: string,
  bus?: LogBus
): Promise<Hono> {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof ValidationError) {
      return c.json(formatValidationError(err), 422);
    }
    consola.error("Unhandled error:", err);
    return c.json({ message: "Internal server error" }, 500);
  });

  const endpoints = await discoverEndpoints(endpointsDir);
  consola.info(`Loaded ${endpoints.length} endpoint(s) from ${endpointsDir}`);

  for (const endpoint of endpoints) {
    registerEndpoint(app, endpoint, config, bus);
  }

  if (bus) {
    await registerInternalRoutes(app, endpoints, config, bus);
  }

  return app;
}

function registerEndpoint(
  app: Hono,
  endpoint: EndpointDefinition,
  config: SimAPIConfig,
  bus: LogBus | undefined
): void {
  app.on(endpoint.method, endpoint.path, async (c: Context) => {
    const start = Date.now();
    const raw = await buildRawRequest(c);

    const errors = runRequestValidation(endpoint.request, raw);
    const request = new AppRequest(
      raw.headers,
      raw.body,
      raw.form,
      raw.query,
      raw.urlParams,
      errors
    );

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

        const authResult = await config.authHandler(request);
        if (AppResponse.isAppResponse(authResult)) {
          logStatus = authResult.status;
          logBody = authResult.body;
          // biome-ignore lint/suspicious/noExplicitAny: status is a valid HTTP code
          return c.json(authResult.body, authResult.status as any);
        }
      }

      if (endpoint.authHandler) {
        const authResult = await endpoint.authHandler(request);
        if (AppResponse.isAppResponse(authResult)) {
          logStatus = authResult.status;
          logBody = authResult.body;
          // biome-ignore lint/suspicious/noExplicitAny: status is a valid HTTP code
          return c.json(authResult.body, authResult.status as any);
        }
      }

      if (endpoint.delay && endpoint.delay > 0) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, endpoint.delay)
        );
      }

      if (config.autoThrowValidationErrors && endpoint.request) {
        errors.throwValidationError(config.autoThrowValidationErrors);
      }

      if (
        typeof endpoint.failRate === "number" &&
        Math.random() < endpoint.failRate
      ) {
        logStatus = 500;
        logBody = { message: "Simulated failure" };
        return c.json(logBody, 500);
      }

      const response = await endpoint.handler(request);
      logStatus = response.status;
      logBody = response.body;
      // biome-ignore lint/suspicious/noExplicitAny: status is a valid HTTP code
      return c.json(response.body, response.status as any);
    } catch (err) {
      if (err instanceof ValidationError) {
        logStatus = 422;
        logBody = formatValidationError(err, config);
      }
      throw err;
    } finally {
      const durationMs = Date.now() - start;

      if (config.consoleLog) {
        consola.log(
          `${endpoint.method} ${c.req.path} → ${logStatus} (${durationMs}ms)`
        );
      }

      if (bus && config.logEntries !== false) {
        bus
          .log({
            method: endpoint.method,
            path: c.req.path,
            query: JSON.stringify(raw.query),
            requestHeaders: JSON.stringify(raw.headers),
            requestBody: JSON.stringify(raw.body),
            responseStatus: logStatus,
            responseBody: JSON.stringify(logBody),
            durationMs,
            timestamp: new Date().toISOString(),
          })
          .catch((err) => consola.error("log error:", err));
      }
    }
  });
}

function runRequestValidation(
  request: EndpointDefinition["request"],
  raw: RawRequest
): ValidationErrors {
  if (!request) return new ValidationErrors({});

  const bag: Record<string, string[]> = {};

  function collect(
    shape: ZodRawShape | undefined,
    data: Record<string, unknown>
  ) {
    if (!shape) return;
    const result = z.object(shape).safeParse(data);
    if (result.success) return;
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "_");
      if (!bag[field]) bag[field] = [];
      bag[field].push(issue.message);
    }
  }

  collect(request.body, raw.body);
  collect(request.form, raw.form);
  collect(request.query, raw.query);
  collect(request.headers, raw.headers);

  return new ValidationErrors(bag);
}

async function buildRawRequest(c: Context): Promise<RawRequest> {
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body: Record<string, unknown> = {};
  const form: Record<string, unknown> = {};
  const contentType = c.req.header("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  } else if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await c.req.formData().catch(() => null);
    if (formData) {
      formData.forEach((value, key) => {
        form[key] = value;
      });
    }
  }

  const query: Record<string, string> = {};
  new URL(c.req.url).searchParams.forEach((value, key) => {
    query[key] = value;
  });

  return {
    headers,
    body,
    form,
    query,
    urlParams: c.req.param() as Record<string, string>,
  };
}

function formatValidationError(
  err: ValidationError,
  config?: SimAPIConfig
): unknown {
  if (config?.validationErrorFormatter) {
    return config.validationErrorFormatter(err.errorBag);
  }

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
