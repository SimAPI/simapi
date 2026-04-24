import { isRef, resolveSchema } from "./resolver.js";
import type { CodegenContext, OARef, OASchema } from "./types.js";

export function zodFromSchema(
  rawSchema: OASchema | OARef,
  ctx: CodegenContext,
  isProperty = false
): string {
  if (isRef(rawSchema) && rawSchema.$ref.startsWith("#/components/schemas/")) {
    const modelName = rawSchema.$ref.split("/").pop() as string;
    ctx.usedModels.add(modelName);
    return `${modelName}Schema`;
  }

  const spec = ctx.spec;
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
        ? zodFromSchema(schema.items, ctx, true)
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
        chain = `z.object({\n${props.join(",\n")}\n${indent}})`;
      } else {
        chain = "z.record(z.unknown())";
      }
      break;
    }

    default: {
      if (schema.allOf && schema.allOf.length > 0) {
        const schemas = schema.allOf.map((s) => zodFromSchema(s, ctx, true));
        chain =
          schemas.length === 1
            ? (schemas[0] as string)
            : schemas
                .slice(1)
                .reduce((acc, s) => `${acc}.and(${s})`, schemas[0] as string);
        break;
      }
      if (schema.anyOf && schema.anyOf.length > 0) {
        const schemas = schema.anyOf.map((s) => zodFromSchema(s, ctx, true));
        chain = `z.union([${schemas.join(", ")}])`;
        break;
      }
      if (schema.oneOf && schema.oneOf.length > 0) {
        const schemas = schema.oneOf.map((s) => zodFromSchema(s, ctx, true));
        chain = `z.union([${schemas.join(", ")}])`;
        break;
      }
      chain = "z.unknown()";
    }
  }

  if (isNullable) chain += ".nullable()";
  return chain;
}
