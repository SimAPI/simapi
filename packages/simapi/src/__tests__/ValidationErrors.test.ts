import { describe, expect, it } from "vitest";
import { ValidationError, ValidationErrors } from "../core/ValidationErrors.js";

describe("ValidationErrors", () => {
  describe("construction", () => {
    it("hasError is false when bag is empty", () => {
      expect(new ValidationErrors({}).hasError).toBe(false);
    });

    it("hasError is true when bag has entries", () => {
      expect(new ValidationErrors({ email: ["Required"] }).hasError).toBe(true);
    });

    it("errorFields lists fields with errors", () => {
      const e = new ValidationErrors({
        email: ["Required"],
        name: ["Too short"],
      });
      expect(e.errorFields).toContain("email");
      expect(e.errorFields).toContain("name");
    });

    it("errorBag preserves messages", () => {
      const bag = { email: ["Required", "Invalid email"] };
      expect(new ValidationErrors(bag).errorBag).toEqual(bag);
    });
  });

  describe("throwValidationError", () => {
    it("does NOT throw when there are no errors", () => {
      const e = new ValidationErrors({});
      expect(() => e.throwValidationError("laravel")).not.toThrow();
    });

    it("throws ValidationError when hasError is true", () => {
      const e = new ValidationErrors({ email: ["Required"] });
      expect(() => e.throwValidationError("laravel")).toThrow(ValidationError);
    });

    it("thrown error has the correct format", () => {
      const e = new ValidationErrors({ email: ["Required"] });
      try {
        e.throwValidationError("zod");
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
        expect((err as ValidationError).format).toBe("zod");
      }
    });

    it("defaults to laravel format", () => {
      const e = new ValidationErrors({ name: ["Required"] });
      try {
        e.throwValidationError();
      } catch (err) {
        expect((err as ValidationError).format).toBe("laravel");
      }
    });
  });
});
