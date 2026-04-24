import type { OAOperation } from "./types.js";

export function getFileName(path: string, op: OAOperation): string {
  // Prefer tags
  if (op.tags && op.tags.length > 0) {
    const tag = op.tags[0] as string;
    return tag
      .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9_$]/g, "")
      .replace(/^(.)/, (c: string) => c.toLowerCase());
  }

  const segments = path
    .split("/")
    .filter(Boolean)
    .filter((s) => !s.startsWith("{"));

  if (segments.length === 0) return "endpoints";
  if (segments.length === 1) return segments[0] || "endpoints";

  return segments
    .slice(0, -1)
    .map((s, i) => {
      const camel = s.replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase());
      return i === 0 ? camel : camel.charAt(0).toUpperCase() + camel.slice(1);
    })
    .join("");
}

export function getObjectName(
  method: string,
  path: string,
  op: OAOperation,
  existingNames: Set<string>
): string {
  let name: string;

  if (op.summary) {
    name = op.summary
      .replace(/[-_\s]+(.)/g, (_: string, c: string) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9_$]/g, "")
      .replace(/^(.)/, (c: string) => c.toLowerCase());
  } else if (op.operationId) {
    name = op.operationId
      .replace(/[-_\s]+(.)/g, (_: string, c: string) => c.toUpperCase())
      .replace(/^(.)/, (c: string) => c.toLowerCase());
  } else {
    const segments = path
      .split("/")
      .filter(Boolean)
      .filter((s) => !s.startsWith("{"));
    const lastSegment = segments.at(-1) || "handler";
    const capLast = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    name = `${method.toLowerCase()}${capLast}`;
  }

  // Deduplicate
  let finalName = name;
  let counter = 1;
  while (existingNames.has(finalName)) {
    finalName = `${name}${counter}`;
    counter++;
  }
  existingNames.add(finalName);

  return finalName;
}

export function oaToHonoPath(path: string): string {
  return path.replace(/\{([^}]+)\}/g, ":$1");
}
