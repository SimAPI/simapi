import { isRef, resolveResponse, resolveSchema } from "./resolver.js";
import type { CodegenContext, OARef, OAResponse } from "./types.js";

export function pickSuccessStatus(responses: Record<string, unknown>): number {
  const keys = Object.keys(responses);

  for (const preferred of ["200", "201", "204"]) {
    if (keys.includes(preferred)) return Number(preferred);
  }

  const firstSuccess = keys.find((k) => k.startsWith("2"));
  if (firstSuccess) return Number(firstSuccess);

  const firstRedirect = keys.find((k) => k.startsWith("3"));
  if (firstRedirect) return Number(firstRedirect);

  return 200;
}

export function statusToAppResponse(status: number): string {
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

export function buildHandlerBody(
  status: number,
  rawResponse: OAResponse | OARef | undefined,
  ctx: CodegenContext,
  hasValidation: boolean
): string {
  const factory = statusToAppResponse(status);
  const spec = ctx.spec;

  if (status >= 300 && status < 400) {
    const prefix = hasValidation
      ? "req.errors.throwValidationError();\n    "
      : "";
    return `(req) => {\n    ${prefix}return ${factory}("/redirect-target");\n  }`;
  }

  if (status === 204) {
    const prefix = hasValidation
      ? "req.errors.throwValidationError();\n    "
      : "";
    return `(req) => {\n    ${prefix}return ${factory}();\n  }`;
  }

  const response = rawResponse ? resolveResponse(rawResponse, spec) : undefined;
  const schema = response?.content?.["application/json"]?.schema;
  // biome-ignore lint/suspicious/noExplicitAny: complex response schema
  const stub = schema ? buildResponseStub(schema as any, ctx) : null;

  const prefix = hasValidation
    ? "req.errors.throwValidationError();\n    "
    : "";

  const callExpr = stub ? `${factory}(${stub})` : `${factory}({ data: {} })`;

  if (hasValidation) {
    return `(req: AppRequest) => {\n    ${prefix}return ${callExpr};\n  }`;
  }

  return `(_req: AppRequest) => ${callExpr}`;
}

export function buildResponseStub(
  rawSchema: OAResponse | OARef,
  ctx: CodegenContext
): string | null {
  const spec = ctx.spec;
  // biome-ignore lint/suspicious/noExplicitAny: resolving response schema
  const schema = resolveSchema(rawSchema as any, spec);

  if (schema.type !== "object" || !schema.properties) return null;

  const lines = Object.entries(schema.properties)
    .filter(([key]) => schema.required?.includes(key))
    .map(([key, prop]) => {
      const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
        ? key
        : `"${key}"`;
      // biome-ignore lint/suspicious/noExplicitAny: property schema can be anything
      return `    ${propName}: ${scalarStub(prop as any, ctx)}`;
    });

  if (lines.length === 0) return null;

  return `{\n${lines.join(",\n")},\n  }`;
}

// biome-ignore lint/suspicious/noExplicitAny: scalar schema can be anything
export function scalarStub(rawSchema: any, ctx: CodegenContext): string {
  if (isRef(rawSchema) && rawSchema.$ref.startsWith("#/components/schemas/")) {
    const modelName = rawSchema.$ref.split("/").pop() as string;
    if (ctx.spec.components?.schemas?.[modelName]) {
      ctx.usedModels.add(modelName);
      return `make${modelName}()`;
    }
  }

  const spec = ctx.spec;
  const schema = resolveSchema(rawSchema, spec);
  // biome-ignore lint/suspicious/noExplicitAny: schema properties vary by version
  const s = schema as any;

  if (s.const !== undefined) return JSON.stringify(s.const);
  if (s.enum && s.enum.length > 0)
    return `faker.helpers.arrayElement(${JSON.stringify(s.enum)})`;

  const rawType = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  switch (rawType) {
    case "string":
      if (schema.format === "date-time") return "new Date().toISOString()";
      return "faker.string.alphanumeric()";
    case "number":
    case "integer":
      return "faker.number.int()";
    case "boolean":
      return "faker.datatype.boolean()";
    case "array": {
      // biome-ignore lint/suspicious/noExplicitAny: items only exists on array schema
      const items = (schema as any).items;
      if (items) {
        return `[${scalarStub(items, ctx)}]`;
      }
      return "[]";
    }
    case "object":
      return "{}";
    default:
      return "null";
  }
}
