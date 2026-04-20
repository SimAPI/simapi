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
  handler: (req: AppRequest) => AppResponse | Promise<AppResponse>;
}
