export interface ValidatorRule {
  validate(field: string, value: unknown): string | null;
}

export const Validator = {
  required(): ValidatorRule {
    return {
      validate(field, value) {
        if (value === undefined || value === null || value === "") {
          return `The ${field} field is required.`;
        }
        return null;
      },
    };
  },

  string(): ValidatorRule {
    return {
      validate(field, value) {
        if (
          value !== undefined &&
          value !== null &&
          typeof value !== "string"
        ) {
          return `The ${field} field must be a string.`;
        }
        return null;
      },
    };
  },

  number(): ValidatorRule {
    return {
      validate(field, value) {
        if (
          value !== undefined &&
          value !== null &&
          typeof value !== "number"
        ) {
          return `The ${field} field must be a number.`;
        }
        return null;
      },
    };
  },

  boolean(): ValidatorRule {
    return {
      validate(field, value) {
        if (
          value !== undefined &&
          value !== null &&
          typeof value !== "boolean"
        ) {
          return `The ${field} field must be a boolean.`;
        }
        return null;
      },
    };
  },

  minLength(min: number): ValidatorRule {
    return {
      validate(field, value) {
        if (typeof value === "string" && value.length < min) {
          return `The ${field} field must be at least ${min} characters.`;
        }
        return null;
      },
    };
  },

  maxLength(max: number): ValidatorRule {
    return {
      validate(field, value) {
        if (typeof value === "string" && value.length > max) {
          return `The ${field} field must not exceed ${max} characters.`;
        }
        return null;
      },
    };
  },

  email(): ValidatorRule {
    return {
      validate(field, value) {
        if (
          typeof value === "string" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          return `The ${field} field must be a valid email address.`;
        }
        return null;
      },
    };
  },
};
