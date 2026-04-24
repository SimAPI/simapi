import type {
  OAParameter,
  OARef,
  OARequestBody,
  OAResponse,
  OASchema,
  OASpec,
} from "./types.js";

export function isRef(obj: any): obj is OARef {
  return obj && typeof obj === "object" && "$ref" in obj;
}

export function resolveRef<T>(ref: string, spec: OASpec): T | undefined {
  const path = ref.replace(/^#\//, "").split("/");
  let current: any = spec;
  for (const segment of path) {
    if (current && typeof current === "object" && segment in current) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current as T;
}

export function resolveSchema(
  schema: OASchema | OARef,
  spec: OASpec
): OASchema {
  if (isRef(schema)) {
    return resolveRef<OASchema>(schema.$ref, spec) || {};
  }
  return schema;
}

export function resolveParameter(
  param: OAParameter | OARef,
  spec: OASpec
): OAParameter | undefined {
  if (!isRef(param)) return param;
  const resolved = resolveRef<OAParameter | OARef>(param.$ref, spec);
  if (!resolved) return undefined;
  return resolveParameter(resolved, spec);
}

export function resolveRequestBody(
  body: OARequestBody | OARef,
  spec: OASpec
): OARequestBody | undefined {
  if (!isRef(body)) return body;
  const resolved = resolveRef<OARequestBody | OARef>(body.$ref, spec);
  if (!resolved) return undefined;
  return resolveRequestBody(resolved, spec);
}

export function resolveResponse(
  res: OAResponse | OARef,
  spec: OASpec
): OAResponse | undefined {
  if (!isRef(res)) return res;
  const resolved = resolveRef<OAResponse | OARef>(res.$ref, spec);
  if (!resolved) return undefined;
  return resolveResponse(resolved, spec);
}
