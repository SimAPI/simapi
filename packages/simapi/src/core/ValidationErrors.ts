export type ValidationFormat = "laravel" | "zod";

export class ValidationError extends Error {
  constructor(
    public readonly errorBag: Record<string, string[]>,
    public readonly format: ValidationFormat
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export class ValidationErrors {
  readonly hasError: boolean;
  readonly errorFields: string[];
  readonly errorBag: Record<string, string[]>;

  constructor(bag: Record<string, string[]>) {
    this.errorBag = bag;
    this.errorFields = Object.keys(bag).filter(
      (k) => (bag[k]?.length ?? 0) > 0
    );
    this.hasError = this.errorFields.length > 0;
  }

  throwValidationError(format: ValidationFormat = "laravel"): never {
    throw new ValidationError(this.errorBag, format);
  }
}
