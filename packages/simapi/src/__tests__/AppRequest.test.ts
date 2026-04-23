import { describe, expect, it } from "vitest";
import { AppRequest } from "../core/AppRequest.js";
import { ValidationErrors } from "../core/ValidationErrors.js";

function makeRequest(overrides?: {
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  form?: Record<string, unknown>;
  query?: Record<string, string>;
  urlParams?: Record<string, string>;
  errors?: ValidationErrors;
}) {
  return new AppRequest(
    overrides?.headers ?? {},
    overrides?.body ?? {},
    overrides?.form ?? {},
    overrides?.query ?? {},
    overrides?.urlParams ?? {},
    overrides?.errors
  );
}

describe("AppRequest", () => {
  describe("header", () => {
    it("returns header by exact name", () => {
      const req = makeRequest({ headers: { Authorization: "Bearer token" } });
      expect(req.header("Authorization")).toBe("Bearer token");
    });

    it("returns header case-insensitively", () => {
      const req = makeRequest({ headers: { authorization: "Bearer token" } });
      expect(req.header("Authorization")).toBe("Bearer token");
    });

    it("returns undefined for missing header", () => {
      expect(makeRequest().header("X-Missing")).toBeUndefined();
    });
  });

  describe("body", () => {
    it("returns field value", () => {
      const req = makeRequest({ body: { name: "Alice", age: 30 } });
      expect(req.body("name")).toBe("Alice");
      expect(req.body<number>("age")).toBe(30);
    });

    it("returns undefined for missing field", () => {
      expect(makeRequest().body("missing")).toBeUndefined();
    });
  });

  describe("bodyAll", () => {
    it("returns full body", () => {
      const body = { a: 1, b: "two" };
      const req = makeRequest({ body });
      expect(req.bodyAll()).toEqual(body);
    });
  });

  describe("param", () => {
    it("returns query param", () => {
      const req = makeRequest({ query: { page: "2", limit: "10" } });
      expect(req.param("page")).toBe("2");
      expect(req.param("limit")).toBe("10");
    });

    it("returns undefined for missing param", () => {
      expect(makeRequest().param("missing")).toBeUndefined();
    });
  });

  describe("urlParam", () => {
    it("returns URL path parameter", () => {
      const req = makeRequest({ urlParams: { id: "42" } });
      expect(req.urlParam("id")).toBe("42");
    });

    it("returns undefined for missing URL param", () => {
      expect(makeRequest().urlParam("id")).toBeUndefined();
    });
  });

  describe("errors", () => {
    it("defaults to empty ValidationErrors", () => {
      const req = makeRequest();
      expect(req.errors.hasError).toBe(false);
    });

    it("exposes provided ValidationErrors", () => {
      const errors = new ValidationErrors({ email: ["Required"] });
      const req = makeRequest({ errors });
      expect(req.errors.hasError).toBe(true);
      expect(req.errors.errorBag).toEqual({ email: ["Required"] });
    });
  });
});
