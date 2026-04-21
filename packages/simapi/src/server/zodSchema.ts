// biome-ignore lint/suspicious/noExplicitAny: Zod _def is internal API
export function zodTypeToJsonSchema(schema: any): Record<string, unknown> {
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
      return { type: "array", items: zodTypeToJsonSchema(schema._def.type) };

    case "ZodObject": {
      const shape = schema._def.shape() as Record<string, unknown>;
      return zodShapeToJsonSchema(shape);
    }

    default:
      return {};
  }
}

// biome-ignore lint/suspicious/noExplicitAny: Zod _def is internal API
export function zodShapeToJsonSchema(
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
