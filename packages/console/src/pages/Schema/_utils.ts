import type {
  EndpointInfo,
  JsonSchema,
  JsonSchemaProperty,
} from "../../types.js";
import type { AuthState } from "./_types.js";

export function extractPathParams(path: string): string[] {
  return (path.match(/:(\w+)/g) ?? []).map((m) => m.slice(1));
}

export function fmtJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

export function typeLabel(prop: JsonSchemaProperty): string {
  if (!prop.type) return "unknown";
  if (prop.type === "array" && prop.items) return `${typeLabel(prop.items)}[]`;
  return prop.type;
}

export function statusColor(s: number): string {
  if (s >= 500) return "text-red-500 dark:text-red-400";
  if (s >= 400) return "text-yellow-500 dark:text-yellow-400";
  return "text-emerald-500 dark:text-emerald-400";
}

export function buildDefaultBody(
  ep: EndpointInfo,
  type: "json" | "form" = "json"
): string {
  const schema = type === "json" ? ep.schema : ep.formSchema;
  if (!schema?.properties) return "{}";
  const example: Record<string, unknown> = {};
  for (const [k, prop] of Object.entries(schema.properties)) {
    if (prop.default !== undefined) {
      example[k] = prop.default;
    } else {
      example[k] =
        prop.type === "number" || prop.type === "integer"
          ? 0
          : prop.type === "boolean"
            ? false
            : "";
    }
  }
  return JSON.stringify(example, null, 2);
}

export function buildDefaultRows(schema?: JsonSchema): [string, string][] {
  if (!schema?.properties) return [["", ""]];
  const rows: [string, string][] = Object.entries(schema.properties).map(
    ([k, prop]) => {
      return [k, prop.default !== undefined ? String(prop.default) : ""];
    }
  );
  return rows.length > 0 ? rows : [["", ""]];
}

export function buildAuthHeaders(auth: AuthState): Record<string, string> {
  switch (auth.preset) {
    case "bearer":
      return auth.token ? { authorization: `Bearer ${auth.token}` } : {};
    case "basic": {
      if (!auth.username) return {};
      return {
        authorization: `Basic ${btoa(`${auth.username}:${auth.password}`)}`,
      };
    }
    case "apiKey-header":
      return auth.keyName && auth.keyValue
        ? { [auth.keyName]: auth.keyValue }
        : {};
    case "cookie":
      return auth.keyName && auth.keyValue
        ? { cookie: `${auth.keyName}=${auth.keyValue}` }
        : {};
    default:
      return {};
  }
}

export function buildAuthQuery(auth: AuthState): [string, string][] {
  if (auth.preset === "apiKey-query" && auth.keyName && auth.keyValue) {
    return [[auth.keyName, auth.keyValue]];
  }
  return [];
}

export function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
