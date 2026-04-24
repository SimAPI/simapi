import { buildHandlerBody, pickSuccessStatus } from "./handler.js";
import { buildRequestBlock } from "./request.js";
import type {
  CodegenContext,
  OAOperation,
  OAParameter,
  OARef,
} from "./types.js";
import { getObjectName, oaToHonoPath } from "./utils.js";

export function buildEndpoint(
  method: string,
  path: string,
  op: OAOperation,
  pathParams: Array<OAParameter | OARef> | undefined,
  ctx: CodegenContext,
  existingNames: Set<string>
): {
  code: string;
  usedModels: Set<string>;
  requestBlock?: string;
  requestName?: string;
} {
  const spec = ctx.spec;
  const name = getObjectName(method, path, op, existingNames);
  const honoPath = oaToHonoPath(path);
  const authType = op.security ? "secure" : "open";
  const methodUpper = method.toUpperCase();

  // Local context to track models used in THIS endpoint
  const localCtx: CodegenContext = { spec, usedModels: new Set() };

  // Request body + parameters
  const requestName = `${name}Request`;
  const validatorBlock = buildRequestBlock(
    op,
    pathParams,
    localCtx,
    requestName
  );
  const hasValidation = !!validatorBlock;

  // Pick the best success response
  const responses = op.responses ?? {};
  const successStatus = pickSuccessStatus(responses);
  const rawSuccessResponse = responses[String(successStatus)];

  const handlerBody = buildHandlerBody(
    successStatus,
    // biome-ignore lint/suspicious/noExplicitAny: complex response union
    rawSuccessResponse as any,
    localCtx,
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
  if (validatorBlock) lines.push(`  request: ${requestName},`);
  lines.push(`  handler: ${handlerBody},`, "};");

  return {
    code: lines.join("\n"),
    usedModels: localCtx.usedModels,
    requestBlock: validatorBlock ?? undefined,
    requestName: validatorBlock ? requestName : undefined,
  };
}
