import { ValidationErrors } from "./ValidationErrors.js";

export class AppRequest {
  readonly errors: ValidationErrors;

  constructor(
    private readonly _headers: Record<string, string>,
    private readonly _body: Record<string, unknown>,
    private readonly _queryParams: Record<string, string>,
    private readonly _urlParams: Record<string, string>,
    errors?: ValidationErrors
  ) {
    this.errors = errors ?? new ValidationErrors({});
  }

  header(name: string): string | undefined {
    return this._headers[name] ?? this._headers[name.toLowerCase()];
  }

  body<T = unknown>(field: string): T | undefined {
    return this._body[field] as T | undefined;
  }

  bodyAll<T = Record<string, unknown>>(): T {
    return this._body as T;
  }

  param(name: string): string | undefined {
    return this._queryParams[name];
  }

  urlParam(name: string): string | undefined {
    return this._urlParams[name];
  }
}
