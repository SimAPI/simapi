/** Output format for `throwValidationError`. */
export type ValidationFormat = "laravel" | "zod";

/**
 * Thrown by `ValidationErrors.throwValidationError()` when the request body
 * fails Zod validation. Caught automatically by SimAPI and serialised as a
 * `422 Unprocessable Entity` response.
 */
export class ValidationError extends Error {
  constructor(
    /** Raw error bag mapping field names to their error messages. */
    public readonly errorBag: Record<string, string[]>,
    /** The format used when serialising this error to JSON. */
    public readonly format: ValidationFormat
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

/**
 * Holds the result of running an endpoint's `validator` against the request
 * body. Available as `req.errors` inside every handler and auth handler.
 */
export class ValidationErrors {
  /** `true` if at least one field failed validation. */
  readonly hasError: boolean;

  /** Names of all fields that have at least one error. */
  readonly errorFields: string[];

  /**
   * The full error bag: a map from field name to an array of error messages.
   *
   * @example
   * const messages = req.errors.errorBag["email"];
   * // → ["Invalid email address"]
   */
  readonly errorBag: Record<string, string[]>;

  constructor(bag: Record<string, string[]>) {
    this.errorBag = bag;
    this.errorFields = Object.keys(bag).filter(
      (k) => (bag[k]?.length ?? 0) > 0
    );
    this.hasError = this.errorFields.length > 0;
  }

  /**
   * Throws a `ValidationError` if `hasError` is `true`; does nothing otherwise.
   * Safe to call unconditionally — it only throws when there is something to report.
   *
   * @param format  Response format: `"laravel"` (default) or `"zod"`.
   *
   * @example
   * handler: (req) => {
   *   req.errors.throwValidationError();          // laravel format
   *   req.errors.throwValidationError("zod");     // zod format
   *   return AppResponse.created({ data: {} });
   * }
   */
  throwValidationError(format: ValidationFormat = "laravel"): void {
    if (this.hasError) {
      throw new ValidationError(this.errorBag, format);
    }
  }
}
