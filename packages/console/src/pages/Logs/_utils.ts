export function statusColor(s: number): string {
  if (s >= 500) return "text-error";
  if (s >= 400) return "text-warning";
  if (s >= 300) return "text-info";
  return "text-success";
}

export function statusDot(s: number): string {
  if (s >= 500) return "bg-error";
  if (s >= 400) return "bg-warning";
  if (s >= 300) return "bg-info";
  return "bg-success";
}

export function fmtJson(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s || "(empty)";
  }
}

export function fmtHeaders(s: string): Record<string, string> | null {
  try {
    return JSON.parse(s) as Record<string, string>;
  } catch {
    return null;
  }
}

export function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function genPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
