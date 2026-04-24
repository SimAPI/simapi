import { isRef, resolveSchema } from "./resolver.js";
import type { CodegenContext, OARef, OASchema } from "./types.js";

export function zodFromSchema(
  rawSchema: OASchema | OARef,
  ctx: CodegenContext,
  isProperty = false,
  onlyShape = false
): string {
  if (isRef(rawSchema) && rawSchema.$ref.startsWith("#/components/schemas/")) {
    const modelName = rawSchema.$ref.split("/").pop() as string;
    if (ctx.spec.components?.schemas?.[modelName]) {
      ctx.usedModels.add(modelName);
      return `${modelName}Schema`;
    }
  }

  const spec = ctx.spec;
  const schema = resolveSchema(rawSchema, spec);
  // biome-ignore lint/suspicious/noExplicitAny: OpenAPI schemas have version-specific properties
  const s = schema as any;

  // const → z.literal()
  if (s.const !== undefined) {
    return `z.literal(${JSON.stringify(s.const)})`;
  }

  // enum → z.enum()
  if (s.enum && s.enum.length > 0) {
    const values = s.enum.map((v: unknown) => JSON.stringify(v)).join(", ");
    if (s.enum.every((v: unknown) => typeof v === "string")) {
      return `z.enum([${values}])`;
    }
    return `z.union([${s.enum
      .map((v: unknown) => `z.literal(${JSON.stringify(v)})`)
      .join(", ")}])`;
  }

  // Normalise type (3.1 allows arrays like ["string", "null"])
  const rawType = Array.isArray(schema.type)
    ? (schema.type.find((t: unknown) => t !== "null") ?? schema.type[0])
    : schema.type;

  const isNullable =
    (Array.isArray(schema.type) && schema.type.includes("null")) ||
    s.nullable === true;

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
      if (schema.pattern)
        chain += `.regex(new RegExp(${JSON.stringify(schema.pattern)}))`;
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
      const itemSchema = s.items
        ? zodFromSchema(s.items, ctx, true)
        : "z.unknown()";
      chain = `z.array(${itemSchema})`;
      if (schema.minItems !== undefined) chain += `.min(${schema.minItems})`;
      if (schema.maxItems !== undefined) chain += `.max(${schema.maxItems})`;
      break;
    }

    case "object": {
      if (schema.properties) {
        const props = Object.entries(schema.properties).map(([key, prop]) => {
          const required = schema.required?.includes(key) ?? false;
          const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
            ? key
            : `"${key}"`;
          const zodProp = zodFromSchema(prop, ctx, true);
          return `  ${propName}: ${zodProp}${required ? "" : ".optional()"}`;
        });
        const indent = isProperty ? "  " : "";
        const shape = `{\n${props.join(",\n")}\n${indent}}`;
        chain = onlyShape ? shape : `z.object(${shape})`;
      } else {
        chain = onlyShape ? "{}" : "z.record(z.unknown())";
      }
      break;
    }

    default: {
      if (schema.allOf && schema.allOf.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: allOf elements are schemas
        const schemas = schema.allOf.map((s: any) =>
          zodFromSchema(s, ctx, true)
        );
        chain =
          schemas.length === 1
            ? (schemas[0] as string)
            : schemas
                .slice(1)
                .reduce(
                  (acc: string, s: string) => `${acc}.and(${s})`,
                  schemas[0] as string
                );
        break;
      }
      if (schema.anyOf && schema.anyOf.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: anyOf elements are schemas
        const schemas = schema.anyOf.map((s: any) =>
          zodFromSchema(s, ctx, true)
        );
        chain = `z.union([${schemas.join(", ")}])`;
        break;
      }
      if (schema.oneOf && schema.oneOf.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: oneOf elements are schemas
        const schemas = schema.oneOf.map((s: any) =>
          zodFromSchema(s, ctx, true)
        );
        chain = `z.union([${schemas.join(", ")}])`;
        break;
      }
      chain = "z.unknown()";
    }
  }

  if (isNullable) chain += ".nullable()";
  return chain;
}
