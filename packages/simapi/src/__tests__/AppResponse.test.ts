import { describe, expect, it, vi } from "vitest";
import { AppResponse } from "../core/AppResponse.js";

describe("AppResponse", () => {
  describe("status codes", () => {
    it("success returns 200", () => {
      const r = AppResponse.success({ data: "ok" });
      expect(r.status).toBe(200);
      expect(r.body).toEqual({ data: "ok" });
    });

    it("created returns 201", () => {
      expect(AppResponse.created().status).toBe(201);
    });

    it("noContent returns 204", () => {
      const r = AppResponse.noContent();
      expect(r.status).toBe(204);
      expect(r.body).toBeNull();
    });

    it("unauthenticated returns 401", () => {
      expect(AppResponse.unauthenticated().status).toBe(401);
    });

    it("unauthorised returns 403", () => {
      expect(AppResponse.unauthorised().status).toBe(403);
    });

    it("notFound returns 404 with default body", () => {
      const r = AppResponse.notFound();
      expect(r.status).toBe(404);
      expect(r.body).toEqual({ message: "Not found" });
    });

    it("notFound uses custom body when provided", () => {
      const r = AppResponse.notFound({ message: "Post not found" });
      expect(r.body).toEqual({ message: "Post not found" });
    });

    it("error returns 500 with default body", () => {
      const r = AppResponse.error();
      expect(r.status).toBe(500);
      expect(r.body).toEqual({ message: "Internal server error" });
    });
  });

  describe("fail", () => {
    it("returns undefined when probability is 0", () => {
      expect(AppResponse.fail(0)).toBeUndefined();
    });

    it("returns an AppResponse when probability is 1", () => {
      const r = AppResponse.fail(1);
      expect(r).toBeInstanceOf(AppResponse);
      expect(r?.status).toBe(500);
    });

    it("returns 500 body on failure", () => {
      const r = AppResponse.fail(1);
      expect(r?.body).toEqual({ message: "Simulated failure" });
    });
  });

  describe("delay", () => {
    it("resolves after the specified ms", async () => {
      const start = Date.now();
      await AppResponse.delay(50);
      expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    });
  });

  describe("array", () => {
    it("returns an array of the given length", () => {
      const result = AppResponse.array(5, () => ({ id: 1 }));
      expect(result).toHaveLength(5);
    });

    it("calls factory once per item", () => {
      const factory = vi.fn(() => ({ n: Math.random() }));
      AppResponse.array(3, factory);
      expect(factory).toHaveBeenCalledTimes(3);
    });

    it("each item is independently generated", () => {
      let counter = 0;
      const result = AppResponse.array(3, () => ({ index: counter++ }));
      expect(result[0].index).toBe(0);
      expect(result[1].index).toBe(1);
      expect(result[2].index).toBe(2);
    });
  });
});
