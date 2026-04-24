import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import consola from "consola";
import { parse as parseYaml } from "yaml";
import type {
  ImportOptions,
  OAOperation,
  OARef,
  OARequestBody,
  OAResponse,
  OASchema,
  OASpec,
} from "../types.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

// ─── $ref resolution ─────────────────────────────────────────────────────────

function isRef(value: unknown): value is OARef {
  return (
    typeof value === "object" &&
    value !== null &&
    "$ref" in value &&
    typeof (value as OARef).$ref === "string"
  );
}

/**
 * Resolves a `$ref` string like `#/components/schemas/AuthUserResource`
 * against the root spec object.
 */
function resolveRef<T>(ref: string, spec: OASpec): T | undefined {
  if (!ref.startsWith("#/")) return undefined;

  const parts = ref.slice(2).split("/");
  let current: unknown = spec;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current as T;
}

function resolveSchema(schema: OASchema | OARef, spec: OASpec): OASchema {
  if (!isRef(schema)) return schema;

  const resolved = resolveRef<OASchema | OARef>(schema.$ref, spec);
  if (!resolved) return {};

  return resolveSchema(resolved, spec);
}

function resolveResponse(
  response: OAResponse | OARef,
  spec: OASpec
): OAResponse | undefined {
  if (!isRef(response)) return response;

  const resolved = resolveRef<OAResponse | OARef>(response.$ref, spec);
  if (!resolved) return undefined;

  return resolveResponse(resolved, spec);
}

function resolveRequestBody(
  body: OARequestBody | OARef,
  spec: OASpec
): OARequestBody | undefined {
  if (!isRef(body)) return body;

  const resolved = resolveRef<OARequestBody | OARef>(body.$ref, spec);
  if (!resolved) return undefined;

  return resolveRequestBody(resolved, spec);
}

// ─── Zod codegen ─────────────────────────────────────────────────────────────

function zodFromSchema(rawSchema: OASchema | OARef, spec: OASpec): string {
  const schema = resolveSchema(rawSchema, spec);

  // const → z.literal()
  if (schema.const !== undefined) {
    return `z.literal(${JSON.stringify(schema.const)})`;
  }

  // enum → z.enum()
  if (schema.enum && schema.enum.length > 0) {
    const values = schema.enum.map((v) => JSON.stringify(v)).join(", ");
    if (schema.enum.every((v) => typeof v === "string")) {
      return `z.enum([${values}])`;
    }
    return `z.union([${schema.enum.map((v) => `z.literal(${JSON.stringify(v)})`).join(", ")}])`;
  }

  // Normalise type (3.1 allows arrays like ["string", "null"])
  const rawType = Array.isArray(schema.type)
    ? (schema.type.find((t) => t !== "null") ?? schema.type[0])
    : schema.type;

  const isNullable =
    (Array.isArray(schema.type) && schema.type.includes("null")) ||
    schema.nullable === true;

  let chain: string;

  switch (rawType) {
    case "string": {
      chain = "z.string()";
      if (schema.format === "email") chain += ".email()";
      else if (schema.format === "uuid") chain += ".uuid()";
      else if (schema.format === "uri") chain += ".url()";
      else if (schema.format === "date") chain += ".date()";
      else if (schema.format === "date-time") chain += ".datetime()";
      if (schema.minLength !== undefined) chain += `.min(${schema.minLength})`;
      if (schema.maxLength !== undefined) chain += `.max(${schema.maxLength})`;
      if (schema.pattern) chain += `.regex(/${schema.pattern}/)`;
      break;
    }

    case "integer":
    case "number": {
      chain = "z.number()";
      if (rawType === "integer") chain += ".int()";
      if (typeof schema.minimum === "number")
        chain += `.min(${schema.minimum})`;
      if (typeof schema.maximum === "number")
        chain += `.max(${schema.maximum})`;
      break;
    }

    case "boolean":
      chain = "z.boolean()";
      break;

    case "array": {
      const itemSchema = schema.items
        ? zodFromSchema(schema.items, spec)
        : "z.unknown()";
      chain = `z.array(${itemSchema})`;
      if (schema.minItems !== undefined) chain += `.min(${schema.minItems})`;
      if (schema.maxItems !== undefined) chain += `.max(${schema.maxItems})`;
      break;
    }

    case "object": {
      if (schema.properties) {
        const props = Object.entries(schema.properties)
          .map(([key, prop]) => {
            const required = schema.required?.includes(key) ?? false;
            const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
              ? key
              : `"${key}"`;
            const zodProp = zodFromSchema(prop, spec);
            return `${propName}: ${zodProp}${required ? "" : ".optional()"}`;
          })
          .join(", ");
        chain = `z.object({ ${props} })`;
      } else {
        chain = "z.record(z.unknown())";
      }
      break;
    }

    default: {
      // Handle allOf / anyOf / oneOf at the top level
      if (schema.allOf && schema.allOf.length > 0) {
        const schemas = schema.allOf.map((s) => zodFromSchema(s, spec));
        chain =
          schemas.length === 1
            ? (schemas[0] as string)
            : schemas
                .slice(1)
                .reduce((acc, s) => `${acc}.and(${s})`, schemas[0] as string);
        break;
      }
      if (schema.anyOf && schema.anyOf.length > 0) {
        const schemas = schema.anyOf.map((s) => zodFromSchema(s, spec));
        chain = `z.union([${schemas.join(", ")}])`;
        break;
      }
      if (schema.oneOf && schema.oneOf.length > 0) {
        const schemas = schema.oneOf.map((s) => zodFromSchema(s, spec));
        chain = `z.union([${schemas.join(", ")}])`;
        break;
      }
      chain = "z.unknown()";
    }
  }

  if (isNullable) chain += ".nullable()";

  return chain;
}

// ─── Request block codegen ────────────────────────────────────────────────────

function buildRequestBlock(
  rawSchema: OASchema | OARef,
  spec: OASpec
): string | null {
  const schema = resolveSchema(rawSchema, spec);

  if (schema.type !== "object" || !schema.properties) return null;

  const lines = Object.entries(schema.properties).map(([key, prop]) => {
    const required = schema.required?.includes(key) ?? false;
    const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    const zodProp = zodFromSchema(prop, spec);
    return `      ${propName}: ${zodProp}${required ? "" : ".optional()"}`;
  });

  return `  request: {\n    body: {\n${lines.join(",\n")},\n    },\n  },`;
}

// ─── Response → AppResponse mapping ─────────────────────────────────────────

/**
 * Picks the "primary success" status code from the operation's responses map.
 * Prefers 200/201/204, then any 2xx, then any 3xx (for redirect-only ops).
 */
function pickSuccessStatus(responses: Record<string, unknown>): number {
  const keys = Object.keys(responses);

  for (const preferred of ["200", "201", "204"]) {
    if (keys.includes(preferred)) return Number(preferred);
  }

  const firstSuccess = keys.find((k) => k.startsWith("2"));
  if (firstSuccess) return Number(firstSuccess);

  // Redirect-only operations (no 2xx)
  const firstRedirect = keys.find((k) => k.startsWith("3"));
  if (firstRedirect) return Number(firstRedirect);

  return 200;
}

function statusToAppResponse(status: number): string {
  switch (status) {
    case 200:
      return "AppResponse.success";
    case 201:
      return "AppResponse.created";
    case 204:
      return "AppResponse.noContent";
    case 301:
    case 302:
    case 307:
    case 308:
      return "AppResponse.redirect";
    default:
      return status < 400 ? "AppResponse.success" : "AppResponse.error";
  }
}

function buildHandlerBody(
  status: number,
  rawResponse: OAResponse | OARef | undefined,
  spec: OASpec,
  hasValidation: boolean
): string {
  const factory = statusToAppResponse(status);

  // Redirect — emit a placeholder URL
  if (status >= 300 && status < 400) {
    const prefix = hasValidation
      ? "req.errors.throwValidationError();\n    "
      : "";
    return `(req) => {\n    ${prefix}return ${factory}("/redirect-target");\n  }`;
  }

  // No-content
  if (status === 204) {
    const prefix = hasValidation
      ? "req.errors.throwValidationError();\n    "
      : "";
    return `(req) => {\n    ${prefix}return ${factory}();\n  }`;
  }

  // Try to build a stub body from the response schema
  const response = rawResponse ? resolveResponse(rawResponse, spec) : undefined;
  const schema = response?.content?.["application/json"]?.schema;
  const stub = schema ? buildResponseStub(schema, spec) : null;

  const prefix = hasValidation
    ? "req.errors.throwValidationError();\n    "
    : "";

  const callExpr = stub ? `${factory}(${stub})` : `${factory}({ data: {} })`;

  if (hasValidation) {
    return `(req) => {\n    ${prefix}return ${callExpr};\n  }`;
  }

  return `() => ${callExpr}`;
}

/** Generates a shallow stub object literal from an object schema. */
function buildResponseStub(
  rawSchema: OASchema | OARef,
  spec: OASpec
): string | null {
  const schema = resolveSchema(rawSchema, spec);

  if (schema.type !== "object" || !schema.properties) return null;

  const lines = Object.entries(schema.properties)
    .filter(([key]) => schema.required?.includes(key))
    .map(([key, prop]) => {
      const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
        ? key
        : `"${key}"`;
      return `    ${propName}: ${scalarStub(prop, spec)}`;
    });

  if (lines.length === 0) return null;

  return `{\n${lines.join(",\n")},\n  }`;
}

function scalarStub(rawSchema: OASchema | OARef, spec: OASpec): string {
  const schema = resolveSchema(rawSchema, spec);

  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.enum && schema.enum.length > 0)
    return JSON.stringify(schema.enum[0]);

  const rawType = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  switch (rawType) {
    case "string":
      return '"example"';
    case "number":
    case "integer":
      return "0";
    case "boolean":
      return "false";
    case "array":
      return "[]";
    case "object":
      return "{}";
    default:
      return "null";
  }
}

// ─── Naming helpers ───────────────────────────────────────────────────────────

function getFileName(path: string, op: OAOperation): string {
  // Prefer tags
  if (op.tags && op.tags.length > 0) {
    const tag = op.tags[0] as string;
    return tag
      .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9_$]/g, "")
      .replace(/^(.)/, (c: string) => c.toLowerCase());
  }

  const segments = path
    .split("/")
    .filter(Boolean)
    .filter((s) => !s.startsWith("{"));

  if (segments.length === 0) return "endpoints";
  if (segments.length === 1) return segments[0] || "endpoints";

  return segments
    .slice(0, -1)
    .map((s, i) => {
      const camel = s.replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase());
      return i === 0 ? camel : camel.charAt(0).toUpperCase() + camel.slice(1);
    })
    .join("");
}

function getObjectName(
  method: string,
  path: string,
  op: OAOperation,
  existingNames: Set<string>
): string {
  let name: string;

  if (op.summary) {
    name = op.summary
      .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9_$]/g, "")
      .replace(/^(.)/, (c: string) => c.toLowerCase());
  } else if (op.operationId) {
    name = op.operationId
      .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/^(.)/, (c: string) => c.toLowerCase());
  } else {
    const segments = path
      .split("/")
      .filter(Boolean)
      .filter((s) => !s.startsWith("{"));
    const lastSegment = segments.at(-1) || "handler";
    const capLast = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    name = `${method.toLowerCase()}${capLast}`;
  }

  // Deduplicate
  let finalName = name;
  let counter = 1;
  while (existingNames.has(finalName)) {
    finalName = `${name}${counter}`;
    counter++;
  }
  existingNames.add(finalName);

  return finalName;
}

// ─── Path conversion ──────────────────────────────────────────────────────────

function oaToHonoPath(path: string): string {
  return path.replace(/\{([^}]+)\}/g, ":$1");
}

// ─── Endpoint codegen ─────────────────────────────────────────────────────────

function buildEndpoint(
  method: string,
  path: string,
  op: OAOperation,
  spec: OASpec,
  existingNames: Set<string>
): string {
  const name = getObjectName(method, path, op, existingNames);
  const honoPath = oaToHonoPath(path);
  const authType = op.security ? "secure" : "open";
  const methodUpper = method.toUpperCase();

  // Request body
  const rawRequestBody = op.requestBody;
  const requestBody = rawRequestBody
    ? resolveRequestBody(rawRequestBody, spec)
    : undefined;
  const bodySchema = requestBody?.content?.["application/json"]?.schema;
  const validatorBlock = bodySchema
    ? buildRequestBlock(bodySchema, spec)
    : null;
  const hasValidation = !!validatorBlock;

  // Pick the best success response
  const responses = op.responses ?? {};
  const successStatus = pickSuccessStatus(responses);
  const rawSuccessResponse = responses[String(successStatus)];

  const handlerBody = buildHandlerBody(
    successStatus,
    rawSuccessResponse,
    spec,
    hasValidation
  );

  const lines = [
    `export const ${name}: EndpointDefinition = {`,
    `  path: "${honoPath}",`,
    `  method: "${methodUpper}",`,
    `  type: "${authType}",`,
  ];

  if (op.summary) lines.push(`  title: "${op.summary}",`);
  if (op.description) lines.push(`  description: "${op.description}",`);
  if (validatorBlock) lines.push(validatorBlock);
  lines.push(`  handler: ${handlerBody},`, "};");

  return lines.join("\n");
}

// ─── Public runner ────────────────────────────────────────────────────────────

export async function runImportOpenAPI(
  specPath: string,
  cwd?: string,
  opts: ImportOptions = {}
): Promise<void> {
  const root = resolve(cwd ?? process.cwd());
  const absSpec = resolve(root, specPath);
  const outputDir = resolve(root, opts.output ?? "src/endpoints");

  let raw: string;
  try {
    raw = readFileSync(absSpec, "utf8");
  } catch {
    consola.error(`[SimAPI] Cannot read spec: ${absSpec}`);
    process.exit(1);
  }

  const spec: OASpec =
    extname(absSpec).toLowerCase() === ".json"
      ? (JSON.parse(raw) as OASpec)
      : (parseYaml(raw) as OASpec);

  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    consola.error("[SimAPI] No paths found in spec.");
    return;
  }

  const groups = new Map<string, string[]>();
  const groupNames = new Map<string, Set<string>>();

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (!op) continue;

      const fileName = getFileName(path, op);

      if (!groups.has(fileName)) {
        groups.set(fileName, []);
        groupNames.set(fileName, new Set());
      }

      const endpoints = groups.get(fileName) as string[];
      const names = groupNames.get(fileName) as Set<string>;

      endpoints.push(buildEndpoint(method, path, op, spec, names));
    }
  }

  mkdirSync(outputDir, { recursive: true });

  let written = 0;
  for (const [fileName, endpoints] of groups.entries()) {
    const needsZ = endpoints.some((e) => e.includes("z."));
    const imports: string[] = [];
    if (needsZ) imports.push("z");
    imports.push("AppResponse", "type EndpointDefinition");

    const file =
      `import { ${imports.join(", ")} } from "@simapi/simapi";\n\n` +
      endpoints.join("\n\n") +
      "\n";

    const outPath = join(outputDir, `${fileName}.ts`);
    writeFileSync(outPath, file, "utf8");
    consola.log(`[SimAPI] Wrote ${outPath}`);
    written++;
  }

  consola.success(
    `[SimAPI] Import complete — ${written} file(s) written to ${outputDir}/`
  );
}
