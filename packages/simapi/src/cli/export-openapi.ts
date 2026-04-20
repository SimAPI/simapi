import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tsImport } from "tsx/esm/api";
import { stringify as yamlStringify } from "yaml";

import type { SimAPIConfig } from "../core/defineConfig.js";
import type { EndpointDefinition } from "../core/endpoint.js";

// ─── path helpers ─────────────────────────────────────────────────────────────

function honoToOAPath(path: string): string {
  return path.replace(/:([^/]+)/g, "{$1}");
}

function defaultStatusForMethod(method: string): number {
  switch (method.toUpperCase()) {
    case "POST":
      return 201;
    case "DELETE":
      return 204;
    default:
      return 200;
  }
}

// ─── zod schema introspection ─────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: Zod _def is internal API
function zodTypeToJsonSchema(schema: any): Record<string, unknown> {
  const typeName: string = schema?._def?.typeName ?? "";

  switch (typeName) {
    case "ZodOptional":
    case "ZodNullable":
      return zodTypeToJsonSchema(schema._def.innerType);

    case "ZodString": {
      const s: Record<string, unknown> = { type: "string" };
      for (const check of schema._def.checks ?? []) {
        if (check.kind === "min") s.minLength = check.value;
        if (check.kind === "max") s.maxLength = check.value;
        if (check.kind === "email") s.format = "email";
        if (check.kind === "uuid") s.format = "uuid";
        if (check.kind === "url") s.format = "uri";
      }
      return s;
    }

    case "ZodNumber": {
      const s: Record<string, unknown> = { type: "number" };
      for (const check of schema._def.checks ?? []) {
        if (check.kind === "int") s.type = "integer";
        if (check.kind === "min") s.minimum = check.value;
        if (check.kind === "max") s.maximum = check.value;
      }
      return s;
    }

    case "ZodBoolean":
      return { type: "boolean" };

    case "ZodArray":
      return {
        type: "array",
        items: zodTypeToJsonSchema(schema._def.type),
      };

    case "ZodObject": {
      const shape = schema._def.shape() as Record<string, unknown>;
      return zodShapeToJsonSchema(shape);
    }

    default:
      return {};
  }
}

// biome-ignore lint/suspicious/noExplicitAny: Zod _def is internal API
function zodShapeToJsonSchema(
  shape: Record<string, any>
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, schema] of Object.entries(shape)) {
    const isOptional = schema?._def?.typeName === "ZodOptional";
    if (!isOptional) required.push(key);
    properties[key] = zodTypeToJsonSchema(schema);
  }

  const result: Record<string, unknown> = { type: "object", properties };
  if (required.length > 0) result.required = required;
  return result;
}

// ─── openapi builder ──────────────────────────────────────────────────────────

function buildOperation(ep: EndpointDefinition): Record<string, unknown> {
  const status = defaultStatusForMethod(ep.method);

  const operation: Record<string, unknown> = {
    responses: {
      [status]: {
        description: "Success",
        content: {
          "application/json": { schema: { type: "object" } },
        },
      },
      ...(ep.validator
        ? {
            422: {
              description: "Validation error",
              content: {
                "application/json": { schema: { type: "object" } },
              },
            },
          }
        : {}),
    },
  };

  if (ep.type === "secure") {
    operation.security = [{}];
  }

  if (ep.validator) {
    operation.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: zodShapeToJsonSchema(ep.validator as Record<string, unknown>),
        },
      },
    };
  }

  // Path parameters from the route pattern
  const params = [...ep.path.matchAll(/:([^/]+)/g)].map(([, name]) => ({
    name,
    in: "path",
    required: true,
    schema: { type: "string" },
  }));
  if (params.length > 0) operation.parameters = params;

  return operation;
}

// ─── main ─────────────────────────────────────────────────────────────────────

export async function runExportOpenAPI(
  cwd?: string,
  opts: { output?: string; format?: "yaml" | "json" } = {}
): Promise<void> {
  const root = resolve(cwd ?? process.cwd());
  const configPath = join(root, "simapi.config.ts");

  let config: SimAPIConfig | undefined;
  if (existsSync(configPath)) {
    try {
      const mod = await tsImport(configPath, { parentURL: import.meta.url });
      config = (mod.default ?? mod) as SimAPIConfig;
    } catch {
      // proceed with defaults
    }
  }

  const endpointsDir = resolve(root, config?.endpointsDir ?? "endpoints");
  if (!existsSync(endpointsDir)) {
    console.error(`[SimAPI] Endpoints directory not found: ${endpointsDir}`);
    process.exit(1);
  }

  const files = readdirSync(endpointsDir, { recursive: false })
    .filter((f): f is string => typeof f === "string")
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  const endpoints: EndpointDefinition[] = [];

  for (const file of files) {
    try {
      const mod = await tsImport(join(endpointsDir, file), {
        parentURL: import.meta.url,
      });
      for (const key of Object.keys(mod)) {
        const val = mod[key];
        if (
          val &&
          typeof val === "object" &&
          "path" in val &&
          "method" in val &&
          "type" in val
        ) {
          endpoints.push(val as EndpointDefinition);
        }
      }
    } catch (err) {
      console.warn(`[SimAPI] Skipping ${file}:`, err);
    }
  }

  if (endpoints.length === 0) {
    console.error("[SimAPI] No endpoints found.");
    return;
  }

  const paths: Record<string, Record<string, unknown>> = {};
  for (const ep of endpoints) {
    const oaPath = honoToOAPath(ep.path);
    if (!paths[oaPath]) paths[oaPath] = {};
    paths[oaPath][ep.method.toLowerCase()] = buildOperation(ep);
  }

  const spec = {
    openapi: "3.0.3",
    info: {
      title: config?.name ?? "SimAPI",
      description: config?.description ?? "",
      version: "1.0.0",
    },
    ...(ep_hasSecure(endpoints)
      ? {
          components: {
            securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
          },
        }
      : {}),
    paths,
  };

  const outputArg = opts.output ?? "openapi.yaml";
  const format = opts.format ?? (outputArg.endsWith(".json") ? "json" : "yaml");
  const outPath = resolve(root, outputArg);

  const content =
    format === "json"
      ? JSON.stringify(spec, null, 2)
      : yamlStringify(spec, { lineWidth: 120 });

  writeFileSync(outPath, content, "utf8");
  console.log(`[SimAPI] Exported ${endpoints.length} endpoint(s) → ${outPath}`);
}

function ep_hasSecure(endpoints: EndpointDefinition[]): boolean {
  return endpoints.some((ep) => ep.type === "secure");
}
