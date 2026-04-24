// ─── OpenAPI Schema Types (3.0.x & 3.1.x) ────────────────────────────────────

export type OASchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object"
  | "null";

export interface OASchema {
  // Core
  type?: OASchemaType | OASchemaType[]; // 3.1 allows array for nullable
  format?: string;
  title?: string;
  description?: string;
  nullable?: boolean; // 3.0.x — use type: ["string","null"] in 3.1

  // Const / enum
  const?: unknown;
  enum?: unknown[];
  default?: unknown;
  example?: unknown;
  examples?: unknown[];

  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  // Numeric constraints
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  multipleOf?: number;

  // Array constraints
  items?: OASchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // Object constraints
  properties?: Record<string, OASchema>;
  required?: string[];
  additionalProperties?: boolean | OASchema;
  minProperties?: number;
  maxProperties?: number;

  // Composition
  allOf?: OASchema[];
  anyOf?: OASchema[];
  oneOf?: OASchema[];
  not?: OASchema;

  // Discriminator
  discriminator?: { propertyName: string; mapping?: Record<string, string> };

  // References
  $ref?: string;

  // 3.1 extensions
  $schema?: string;
  $defs?: Record<string, OASchema>;
  if?: OASchema;
  then?: OASchema;
  else?: OASchema;
  prefixItems?: OASchema[];
  contains?: OASchema;
  unevaluatedProperties?: boolean | OASchema;
  unevaluatedItems?: boolean | OASchema;
}

// ─── Media Type ───────────────────────────────────────────────────────────────

export interface OAMediaType {
  schema?: OASchema;
  example?: unknown;
  examples?: Record<string, OAExample>;
  encoding?: Record<string, OAEncoding>;
}

export interface OAExample {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
  $ref?: string;
}

export interface OAEncoding {
  contentType?: string;
  headers?: Record<string, OAHeader | OARef>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

// ─── Header ───────────────────────────────────────────────────────────────────

export interface OAHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: OASchema;
  example?: unknown;
}

// ─── Parameters ───────────────────────────────────────────────────────────────

export interface OAParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  schema?: OASchema;
  example?: unknown;
  examples?: Record<string, OAExample | OARef>;
  content?: Record<string, OAMediaType>;
}

// ─── Request Body ─────────────────────────────────────────────────────────────

export interface OARequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, OAMediaType>;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface OAResponse {
  description: string;
  headers?: Record<string, OAHeader | OARef>;
  content?: Record<string, OAMediaType>;
  links?: Record<string, unknown>;
}

export type OAResponses = Record<string, OAResponse | OARef>;

// ─── Operation ────────────────────────────────────────────────────────────────

export interface OAOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  security?: Array<Record<string, string[]>>;
  parameters?: Array<OAParameter | OARef>;
  requestBody?: OARequestBody | OARef;
  responses?: OAResponses;
  callbacks?: Record<string, unknown>;
  servers?: OAServer[];
}

// ─── Path Item ────────────────────────────────────────────────────────────────

export type OAPathItem = Partial<
  Record<"get" | "post" | "put" | "patch" | "delete", OAOperation>
> & {
  summary?: string;
  description?: string;
  parameters?: Array<OAParameter | OARef>;
  servers?: OAServer[];
};

// ─── Components ───────────────────────────────────────────────────────────────

export interface OAComponents {
  schemas?: Record<string, OASchema | OARef>;
  responses?: Record<string, OAResponse | OARef>;
  parameters?: Record<string, OAParameter | OARef>;
  requestBodies?: Record<string, OARequestBody | OARef>;
  headers?: Record<string, OAHeader | OARef>;
  securitySchemes?: Record<string, OASecurityScheme | OARef>;
  examples?: Record<string, OAExample | OARef>;
  links?: Record<string, unknown>;
  callbacks?: Record<string, unknown>;
  pathItems?: Record<string, OAPathItem | OARef>; // 3.1
}

// ─── Security Scheme ──────────────────────────────────────────────────────────

export type OASecurityScheme = {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect" | "mutualTLS";
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: unknown;
  openIdConnectUrl?: string;
};

// ─── Server ───────────────────────────────────────────────────────────────────

export interface OAServer {
  url: string;
  description?: string;
  variables?: Record<
    string,
    { default: string; enum?: string[]; description?: string }
  >;
}

// ─── Info ─────────────────────────────────────────────────────────────────────

export interface OAInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: { name?: string; url?: string; email?: string };
  license?: { name: string; url?: string; identifier?: string };
  summary?: string; // 3.1
}

// ─── $ref ─────────────────────────────────────────────────────────────────────

export interface OARef {
  $ref: string;
  summary?: string;
  description?: string;
}

// ─── Root Spec ────────────────────────────────────────────────────────────────

export interface OASpec {
  openapi: string; // "3.0.x" | "3.1.x"
  info: OAInfo;
  paths?: Record<string, OAPathItem>;
  components?: OAComponents;
  servers?: OAServer[];
  security?: Array<Record<string, string[]>>;
  tags?: Array<{ name: string; description?: string }>;
  externalDocs?: { description?: string; url: string };

  // 3.1-only root-level webhooks
  webhooks?: Record<string, OAPathItem | OARef>;

  // 3.1-only JSON Schema dialect
  jsonSchemaDialect?: string;
}

// ─── Importer options ─────────────────────────────────────────────────────────

export interface ImportOptions {
  /** Directory to write generated endpoint files into. Default: `"src/endpoints"`. */
  output?: string;
  /** Overwrite existing files without prompting. Default: `false`. */
  force?: boolean;
}

// ─── Exporter options ─────────────────────────────────────────────────────────

export interface ExportOptions {
  /** Output file path. Default: `"openapi.yaml"`. */
  output?: string;
  /** Output format. Inferred from `output` extension when not set. */
  format?: "yaml" | "json";
}
