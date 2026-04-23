// biome-ignore lint/suspicious/noExplicitAny: Zod _def is internal API
export function zodTypeToJsonSchema(schema: any): Record<string, unknown> {
  const typeName: string = schema?._def?.typeName ?? "";
  let result: Record<string, unknown> = {};

  switch (typeName) {
    case "ZodOptional":
    case "ZodNullable":
      result = zodTypeToJsonSchema(schema._def.innerType);
      break;

    case "ZodString": {
      const s: Record<string, unknown> = { type: "string" };

      for (const check of schema._def.checks ?? []) {
        if (check.kind === "min") s.minLength = check.value;
        if (check.kind === "max") s.maxLength = check.value;
        if (check.kind === "email") s.format = "email";
        if (check.kind === "uuid") s.format = "uuid";
        if (check.kind === "url") s.format = "uri";
      }

      result = s;

      break;
    }

    case "ZodNumber": {
      const s: Record<string, unknown> = { type: "number" };

      for (const check of schema._def.checks ?? []) {
        if (check.kind === "int") s.type = "integer";
        if (check.kind === "min") s.minimum = check.value;
        if (check.kind === "max") s.maximum = check.value;
      }

      result = s;

      break;
    }

    case "ZodBoolean":
      result = { type: "boolean" };
      break;

    case "ZodArray":
      result = { type: "array", items: zodTypeToJsonSchema(schema._def.type) };
      break;

    case "ZodObject": {
      const shape = schema._def.shape() as Record<string, unknown>;
      result = zodShapeToJsonSchema(shape);
      break;
    }

    case "ZodDefault": {
      result = zodTypeToJsonSchema(schema._def.innerType);
      try {
        result.default = schema._def.defaultValue();
      } catch {
        // ignore
      }
      break;
    }
  }

  if (schema?._def?.defaultValue && result.default === undefined) {
    try {
      result.default = schema._def.defaultValue();
    } catch {
      // ignore
    }
  }

  return result;
}

export function zodShapeToJsonSchema(
  // biome-ignore lint/suspicious/noExplicitAny: Zod _def is internal API
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
