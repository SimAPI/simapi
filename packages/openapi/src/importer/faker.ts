import { isRef, resolveSchema } from "./resolver.js";
import type { OARef, OASchema, OASpec } from "./types.js";

export function fakerValueFromSchema(
  rawSchema: OASchema | OARef,
  spec: OASpec
): string {
  if (isRef(rawSchema) && rawSchema.$ref.startsWith("#/components/schemas/")) {
    const modelName = rawSchema.$ref.split("/").pop() as string;
    return `make${modelName}()`;
  }

  const schema = resolveSchema(rawSchema, spec);

  if (schema.enum) {
    return `faker.helpers.arrayElement(${JSON.stringify(schema.enum)})`;
  }

  switch (schema.type) {
    case "string":
      if (schema.format === "date-time")
        return "faker.date.past().toISOString()";
      if (schema.format === "date")
        return "faker.date.past().toISOString().split('T')[0]";
      if (schema.format === "email") return "faker.internet.email()";
      return "faker.string.alphanumeric()";
    case "integer":
      return "faker.number.int()";
    case "number":
      return "faker.number.float()";
    case "boolean":
      return "faker.datatype.boolean()";
    case "array": {
      const item = schema.items
        ? fakerValueFromSchema(schema.items, spec)
        : "{}";
      return `[${item}]`;
    }
    case "object": {
      if (!schema.properties) return "{}";
      const props = Object.entries(schema.properties).map(([key, prop]) => {
        return `  ${key}: ${fakerValueFromSchema(prop, spec)}`;
      });
      return `{\n${props.join(",\n")}\n}`;
    }
    default:
      return "{}";
  }
}
