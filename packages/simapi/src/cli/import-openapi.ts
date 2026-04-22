import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

type OASchema = {
  type?: string;
  format?: string;
  properties?: Record<string, OASchema>;
  required?: string[];
  items?: OASchema;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  $ref?: string;
};

type OAOperation = {
  operationId?: string;
  summary?: string;
  description?: string;
  security?: unknown[];
  requestBody?: {
    content?: { "application/json"?: { schema?: OASchema } };
  };
};

type OAPathItem = Partial<
  Record<"get" | "post" | "put" | "patch" | "delete", OAOperation>
>;

type OASpec = { paths?: Record<string, OAPathItem> };

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

function oaToHonoPath(path: string): string {
  return path.replace(/\{([^}]+)\}/g, ":$1");
}

function resourceName(path: string): string {
  const parts = path.split("/").filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const segment = parts[i];
    if (segment && !segment.startsWith("{")) return segment;
  }
  return "endpoints";
}

function toHandlerName(
  method: string,
  path: string,
  operationId?: string
): string {
  if (operationId) {
    return operationId
      .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/^(.)/, (c: string) => c.toLowerCase());
  }
  const resource = resourceName(path);
  const isItem = /\{[^}]+\}/.test(path.split("/").at(-1) ?? "");
  const prefix: Record<string, string> = {
    get: isItem ? "get" : "list",
    post: "create",
    put: "update",
    patch: "patch",
    delete: "remove",
  };
  const cap = resource.charAt(0).toUpperCase() + resource.slice(1);
  return `${prefix[method] ?? method}${cap}`;
}

function zodFromSchema(schema: OASchema): string {
  if (schema.$ref) return "z.unknown()";
  switch (schema.type) {
    case "string": {
      let chain = "z.string()";
      if (schema.format === "email") chain += ".email()";
      if (schema.format === "uuid") chain += ".uuid()";
      if (schema.minLength !== undefined) chain += `.min(${schema.minLength})`;
      if (schema.maxLength !== undefined) chain += `.max(${schema.maxLength})`;
      return chain;
    }
    case "integer":
    case "number": {
      let chain = "z.number()";
      if (schema.type === "integer") chain += ".int()";
      if (schema.minimum !== undefined) chain += `.min(${schema.minimum})`;
      if (schema.maximum !== undefined) chain += `.max(${schema.maximum})`;
      return chain;
    }
    case "boolean":
      return "z.boolean()";
    case "array":
      return `z.array(${schema.items ? zodFromSchema(schema.items) : "z.unknown()"})`;
    default:
      return "z.unknown()";
  }
}

function buildRequestBlock(schema: OASchema): string | null {
  if (schema.type !== "object" || !schema.properties) return null;
  const lines = Object.entries(schema.properties).map(([key, prop]) => {
    const required = schema.required?.includes(key) ?? false;
    return `      ${key}: ${zodFromSchema(prop)}${required ? "" : ".optional()"}`;
  });
  return `  request: {\n    body: {\n${lines.join(",\n")},\n    },\n  },`;
}

function buildEndpoint(method: string, path: string, op: OAOperation): string {
  const name = toHandlerName(method, path, op.operationId);
  const honoPath = oaToHonoPath(path);
  const authType = op.security ? "secure" : "open";
  const methodUpper = method.toUpperCase();

  const bodySchema = op.requestBody?.content?.["application/json"]?.schema;
  const validatorBlock = bodySchema ? buildRequestBlock(bodySchema) : null;

  const handlerBody = validatorBlock
    ? `(req) => {\n    req.errors.throwValidationError();\n    return AppResponse.created({ data: {} });\n  }`
    : `() => AppResponse.success({ data: {} })`;

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

export async function runImportOpenAPI(
  specPath: string,
  cwd?: string,
  opts: { output?: string } = {}
): Promise<void> {
  const root = resolve(cwd ?? process.cwd());
  const absSpec = resolve(root, specPath);
  const outputDir = resolve(root, opts.output ?? "src/endpoints");

  let raw: string;
  try {
    raw = readFileSync(absSpec, "utf8");
  } catch {
    console.error(`[SimAPI] Cannot read spec: ${absSpec}`);
    process.exit(1);
  }

  const spec: OASpec =
    extname(absSpec).toLowerCase() === ".json"
      ? JSON.parse(raw)
      : parseYaml(raw);

  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    console.error("[SimAPI] No paths found in spec.");
    return;
  }

  const groups = new Map<string, string[]>();
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    const resource = resourceName(path);
    if (!groups.has(resource)) groups.set(resource, []);
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (!op) continue;
      groups.get(resource)?.push(buildEndpoint(method, path, op));
    }
  }

  mkdirSync(outputDir, { recursive: true });

  let written = 0;
  for (const [resource, endpoints] of groups.entries()) {
    const needsZ = endpoints.some((e) => e.includes("z."));
    const imports: string[] = [];
    if (needsZ) imports.push("z");
    imports.push("AppResponse", "type EndpointDefinition");

    const file =
      `import { ${imports.join(", ")} } from "@simapi/simapi";\n\n` +
      endpoints.join("\n\n") +
      "\n";

    const outPath = join(outputDir, `${resource}.ts`);
    writeFileSync(outPath, file, "utf8");
    console.log(`[SimAPI] Wrote ${outPath}`);
    written++;
  }

  console.log(
    `[SimAPI] Import complete — ${written} file(s) written to ${outputDir}/`
  );
}
