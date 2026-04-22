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
  GET: "bg-method-get/5 text-method-get border-method-get/10",
  POST: "bg-method-post/5 text-method-post border-method-post/10",
  PUT: "bg-method-put/5 text-method-put border-method-put/10",
  PATCH: "bg-method-patch/5 text-method-patch border-method-patch/10",
  DELETE: "bg-method-delete/5 text-method-delete border-method-delete/10",
};

export const METHOD_ACCENT: Record<string, string> = {
  GET: "text-method-get",
  POST: "text-method-post",
  PUT: "text-method-put",
  PATCH: "text-method-patch",
  DELETE: "text-method-delete",
};

export const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);
