import { isRef, resolveSchema } from "./resolver.js";
import type { CodegenContext } from "./types.js";

export function fakerValueFromSchema(
  // biome-ignore lint/suspicious/noExplicitAny: complex schema union
  rawSchema: any,
  ctx: CodegenContext
): string {
  if (isRef(rawSchema) && rawSchema.$ref.startsWith("#/components/schemas/")) {
    const modelName = rawSchema.$ref.split("/").pop() as string;
    if (ctx.spec.components?.schemas?.[modelName]) {
      ctx.usedModels.add(modelName);
      return `make${modelName}()`;
    }
  }

  const spec = ctx.spec;
  // biome-ignore lint/suspicious/noExplicitAny: schema properties vary by version
  const schema = resolveSchema(rawSchema, spec) as any;

  if (schema.enum && schema.enum.length > 0)
    return `faker.helpers.arrayElement(${JSON.stringify(schema.enum)})`;

  const rawType = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  switch (rawType) {
    case "string":
      if (schema.format === "email") return "faker.internet.email()";
      if (schema.format === "date-time")
        return "faker.date.past().toISOString()";
      return "faker.string.alphanumeric()";
    case "number":
    case "integer":
      return "faker.number.int()";
    case "boolean":
      return "faker.datatype.boolean()";
    case "array": {
      const items = schema.items;
      if (items) {
        return `[${fakerValueFromSchema(items, ctx)}]`;
      }
      return "[]";
    }
    case "object": {
      if (schema.properties) {
        const props = Object.entries(schema.properties).map(([key, prop]) => {
          const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
            ? key
            : `"${key}"`;
          return `  ${propName}: ${fakerValueFromSchema(prop, ctx)}`;
        });
        return `{\n${props.join(",\n")}\n}`;
      }
      return "{}";
    }
    default:
      return "null";
  }
}
