import type {
  EndpointInfo,
  JsonSchema,
  JsonSchemaProperty,
} from "../../types.js";
import type { AuthState } from "./_types.js";

export function extractPathParams(path: string): string[] {
  return (path.match(/:(\w+)/g) ?? []).map((match) => match.slice(1));
}

export function fmtJson(jsonString: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch {
    return jsonString;
  }
}

export function typeLabel(prop: JsonSchemaProperty): string {
  if (!prop.type) return "any";

  if (Array.isArray(prop.type)) {
    return prop.type
      .map((t) => (typeof t === "string" ? t : "any"))
      .join(" or ");
  }

  if (prop.type === "array" && prop.items) return `${typeLabel(prop.items)}[]`;

  return prop.type;
}

export function statusColor(status: number): string {
  if (status >= 500) return "text-red-500 dark:text-red-400";
  if (status >= 400) return "text-yellow-500 dark:text-yellow-400";
  return "text-emerald-500 dark:text-emerald-400";
}

export function buildDefaultBody(
  endpoint: EndpointInfo,
  type: "json" | "form" = "json"
): string {
  const schema = type === "json" ? endpoint.schema : endpoint.formSchema;
  if (!schema?.properties) return "{}";
  const example: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.default !== undefined) {
      example[key] = prop.default;
    } else {
      example[key] =
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
    ([key, prop]) => {
      return [key, prop.default !== undefined ? String(prop.default) : ""];
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
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
}
