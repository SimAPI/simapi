import { ValidationErrors } from "./ValidationErrors.js";
import type { ValidatorRule } from "./Validator.js";

export type ValidationRules = Record<string, ValidatorRule[]>;

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
