import type { AuthPreset } from "./_types.js";

export const AUTH_OPTIONS: { value: AuthPreset; label: string }[] = [
  { value: "none", label: "No Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
  { value: "apiKey-header", label: "API Key — Header" },
  { value: "apiKey-query", label: "API Key — Query Param" },
  { value: "cookie", label: "Cookie / Session" },
];

export const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900",
  POST: "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900",
  PUT: "bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-100 dark:border-yellow-900",
  PATCH:
    "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-900",
  DELETE:
    "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900",
};

export const METHOD_ACCENT: Record<string, string> = {
  GET: "text-blue-600 dark:text-blue-400",
  POST: "text-green-600 dark:text-green-400",
  PUT: "text-yellow-600 dark:text-yellow-400",
  PATCH: "text-orange-600 dark:text-orange-400",
  DELETE: "text-red-600 dark:text-red-400",
};

export const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);
