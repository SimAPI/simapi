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
  title?: string;
  description?: string;
  validator?: z.ZodRawShape;
  /** Probability (0–1) of returning a simulated 500 before the handler runs. */
  failRate?: number;
  /** Artificial delay in milliseconds before the handler runs. */
  delay?: number;
  handler: (req: AppRequest) => AppResponse | Promise<AppResponse>;
}
