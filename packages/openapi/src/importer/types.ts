import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

export type OASpec = OpenAPIV3.Document | OpenAPIV3_1.Document;
export type OASchema = OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
export type OARef = OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject;
export type OAParameter =
  | OpenAPIV3.ParameterObject
  | OpenAPIV3_1.ParameterObject;
export type OAOperation =
  | OpenAPIV3.OperationObject
  | OpenAPIV3_1.OperationObject;
export type OARequestBody =
  | OpenAPIV3.RequestBodyObject
  | OpenAPIV3_1.RequestBodyObject;
export type OAResponse = OpenAPIV3.ResponseObject | OpenAPIV3_1.ResponseObject;

export interface CodegenContext {
  spec: OASpec;
  usedModels: Set<string>;
}
