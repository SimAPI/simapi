export function statusColor(s: number): string {
  if (s >= 500) return "text-red-500 dark:text-red-400";
  if (s >= 400) return "text-yellow-500 dark:text-yellow-400";
  if (s >= 300) return "text-blue-500 dark:text-blue-400";
  return "text-emerald-500 dark:text-emerald-400";
}

export function statusDot(s: number): string {
  if (s >= 500) return "bg-red-400";
  if (s >= 400) return "bg-yellow-400";
  if (s >= 300) return "bg-blue-400";
  return "bg-emerald-400";
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
