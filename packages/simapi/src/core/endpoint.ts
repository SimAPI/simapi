import type { z } from "zod";
import type { AppRequest } from "./AppRequest.js";
import type { AppResponse } from "./AppResponse.js";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface EndpointDefinition {
  path: string;
  method: HttpMethod;
  type: "open" | "secure";
  validator?: z.ZodRawShape;
  handler: (req: AppRequest) => AppResponse | Promise<AppResponse>;
}
