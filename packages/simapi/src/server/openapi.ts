import { AppRequest } from "../core/AppRequest.js";
import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";
import { ValidationErrors } from "../core/ValidationErrors.js";
import { zodShapeToJsonSchema } from "./zodSchema.js";

declare const __SIMAPI_VERSION__: string;

const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

function honoToOAPath(path: string): string {
  return path.replace(/:([^/]+)/g, "{$1}");
}

function defaultStatus(method: string): number {
  if (method.toUpperCase() === "POST") return 201;
  if (method.toUpperCase() === "DELETE") return 204;
  return 200;
}

async function getResponseExample(ep: EndpointDefinition): Promise<unknown> {
  try {
    const req = new AppRequest({}, {}, {}, {}, new ValidationErrors({}));
    const result = await ep.handler(req);
    return result.body;
  } catch {
    return undefined;
  }
}

async function buildOperation(
  ep: EndpointDefinition
): Promise<Record<string, unknown>> {
  const successStatus = defaultStatus(ep.method);
  const responseExample = await getResponseExample(ep);

  const operation: Record<string, unknown> = {
    ...(ep.title ? { summary: ep.title } : {}),
    ...(ep.description ? { description: ep.description } : {}),
    ...(ep.type === "secure" ? { security: [{ bearerAuth: [] }] } : {}),
  };

  const pathParams = [...ep.path.matchAll(/:([^/]+)/g)].map(([, name]) => ({
    name,
    in: "path",
    required: true,
    schema: { type: "string" },
  }));
  if (pathParams.length > 0) operation.parameters = pathParams;

  if (BODY_METHODS.has(ep.method) && ep.request?.body) {
    operation.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: zodShapeToJsonSchema(
            ep.request.body as Record<string, unknown>
          ),
        },
      },
    };
  }

  const hasValidation = !!(
    ep.request?.body ??
    ep.request?.query ??
    ep.request?.headers
  );

  operation.responses = {
    [successStatus]: {
      description: successStatus === 204 ? "No content" : "Success",
      ...(responseExample !== undefined && successStatus !== 204
        ? {
            content: {
              "application/json": {
                schema: { type: "object" },
                example: responseExample,
              },
            },
          }
        : {}),
    },
    ...(ep.type === "secure" ? { "401": { description: "Unauthorized" } } : {}),
    ...(hasValidation ? { "422": { description: "Validation error" } } : {}),
    "500": { description: "Internal server error" },
  };

  return operation;
}

export async function buildOpenApiSpec(
  endpoints: EndpointDefinition[],
  config: Pick<SimAPIConfig, "name" | "description">
): Promise<Record<string, unknown>> {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const ep of endpoints) {
    const oaPath = honoToOAPath(ep.path);
    if (!paths[oaPath]) paths[oaPath] = {};
    paths[oaPath][ep.method.toLowerCase()] = await buildOperation(ep);
  }

  const hasSecurity = endpoints.some((ep) => ep.type === "secure");

  return {
    openapi: "3.0.3",
    info: {
      title: config.name || "SimAPI",
      ...(config.description ? { description: config.description } : {}),
      version: __SIMAPI_VERSION__,
    },
    ...(hasSecurity
      ? {
          components: {
            securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
          },
        }
      : {}),
    paths,
  };
}
