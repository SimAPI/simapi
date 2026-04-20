import { ValidationErrors } from "./ValidationErrors.js";
import type { ValidatorRule } from "./Validator.js";

export type ValidationRules = Record<string, ValidatorRule[]>;

export class AppRequest {
  constructor(
    private readonly _headers: Record<string, string>,
    private readonly _body: Record<string, unknown>,
    private readonly _queryParams: Record<string, string>,
    private readonly _urlParams: Record<string, string>
  ) {}

  /** Get a request header by name (case-insensitive). */
  header(name: string): string | undefined {
    return this._headers[name] ?? this._headers[name.toLowerCase()];
  }

  /** Get a field from the parsed request body. */
  body<T = unknown>(field: string): T | undefined {
    return this._body[field] as T | undefined;
  }

  /** Get the full parsed request body. */
  bodyAll<T = Record<string, unknown>>(): T {
    return this._body as T;
  }

  /** Get a query string parameter (?key=value). */
  param(name: string): string | undefined {
    return this._queryParams[name];
  }

  /** Get a URL path parameter (e.g. :slug in the route pattern). */
  urlParam(name: string): string | undefined {
    return this._urlParams[name];
  }

  /** Validate request body fields against the given rules. */
  validateBody(rules: ValidationRules): ValidationErrors {
    const bag: Record<string, string[]> = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = this._body[field];
      const messages: string[] = [];

      for (const rule of fieldRules) {
        const error = rule.validate(field, value);
        if (error !== null) {
          messages.push(error);
        }
      }

      if (messages.length > 0) {
        bag[field] = messages;
      }
    }

    return new ValidationErrors(bag);
  }
}
