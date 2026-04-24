import { isRef, resolveParameter, resolveRequestBody } from "./resolver.js";
import type {
  CodegenContext,
  OAOperation,
  OAParameter,
  OARef,
} from "./types.js";
import { zodFromSchema } from "./zod.js";

export function buildRequestBlock(
  op: OAOperation,
  pathParams: Array<OAParameter | OARef> | undefined,
  ctx: CodegenContext,
  requestName: string
): string | null {
  const sections: string[] = [];
  const spec = ctx.spec;

  // 1. Body
  const rawRequestBody = op.requestBody;
  if (rawRequestBody) {
    const requestBody = resolveRequestBody(rawRequestBody, spec);
    const bodySchema = requestBody?.content?.["application/json"]?.schema;
    if (bodySchema) {
      if (
        isRef(bodySchema) &&
        bodySchema.$ref.startsWith("#/components/schemas/")
      ) {
        const modelName = bodySchema.$ref.split("/").pop() as string;
        ctx.usedModels.add(modelName);
        sections.push(`    body: ${modelName}Schema.shape`);
      } else {
        const zodProp = zodFromSchema(bodySchema, ctx, true);
        sections.push(`    body: ${zodProp}`);
      }
    }
  }

  // 2. Query/Headers/Params
  const allParams = [...(pathParams ?? []), ...(op.parameters ?? [])];
  const query = buildRequestParams(allParams, "query", ctx);
  const headers = buildRequestParams(allParams, "header", ctx);
  const params = buildRequestParams(allParams, "path", ctx);

  if (query) sections.push(`    query: ${query}`);
  if (headers) sections.push(`    headers: ${headers}`);
  if (params) sections.push(`    params: ${params}`);

  if (sections.length === 0) return null;

  return `export const ${requestName}: RequestDefinition = {\n${sections.join(",\n")}\n};`;
}

function buildRequestParams(
  params: Array<OAParameter | OARef>,
  inType: string,
  ctx: CodegenContext
): string | null {
  const filtered = params
    .map((p) => resolveParameter(p, ctx.spec))
    .filter((p): p is OAParameter => !!p && p.in === inType);

  if (filtered.length === 0) return null;

  const lines = filtered.map((p) => {
    const schema = p.schema ? zodFromSchema(p.schema, ctx, true) : "z.any()";
    const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(p.name)
      ? p.name
      : `"${p.name}"`;
    return `      ${propName}: ${schema}${p.required ? "" : ".optional()"}`;
  });

  return `{\n${lines.join(",\n")},\n    }`;
}
