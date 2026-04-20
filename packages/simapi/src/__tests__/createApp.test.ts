import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { AppRequest } from "../core/AppRequest.js";
import { AppResponse } from "../core/AppResponse.js";
import type { EndpointDefinition } from "../core/endpoint.js";
import { createApp } from "../server/createApp.js";

// createApp reads endpoints from disk; for unit tests we stub discoverEndpoints
vi.mock("../server/discovery.js", () => ({
  discoverEndpoints: vi.fn(async () => []),
}));
vi.mock("../server/internalRoutes.js", () => ({
  registerInternalRoutes: vi.fn(),
}));

import { discoverEndpoints } from "../server/discovery.js";

const mockDiscovery = vi.mocked(discoverEndpoints);

async function buildApp(
  endpoints: EndpointDefinition[],
  config: Parameters<typeof createApp>[0] = { name: "test" }
) {
  mockDiscovery.mockResolvedValueOnce(endpoints);
  return createApp(config, "/fake/endpoints");
}

describe("createApp", () => {
  describe("basic routing", () => {
    it("handles GET endpoint", async () => {
      const app = await buildApp([
        {
          path: "/api/hello",
          method: "GET",
          type: "open",
          handler: () => AppResponse.success({ message: "hi" }),
        },
      ]);

      const res = await app.request("/api/hello");
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ message: "hi" });
    });

    it("handles POST endpoint", async () => {
      const app = await buildApp([
        {
          path: "/api/items",
          method: "POST",
          type: "open",
          handler: (req: AppRequest) =>
            AppResponse.created({ data: req.body("name") }),
        },
      ]);

      const res = await app.request("/api/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Widget" }),
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json).toEqual({ data: "Widget" });
    });

    it("returns 404 for unknown routes via Hono default", async () => {
      const app = await buildApp([]);
      const res = await app.request("/not-found");
      expect(res.status).toBe(404);
    });
  });

  describe("secure endpoints", () => {
    it("returns 500 when secure endpoint has no authHandler", async () => {
      const app = await buildApp([
        {
          path: "/api/secret",
          method: "GET",
          type: "secure",
          handler: () => AppResponse.success({ secret: true }),
        },
      ]);
      const res = await app.request("/api/secret");
      expect(res.status).toBe(500);
    });

    it("rejects request when authHandler returns AppResponse", async () => {
      const app = await buildApp(
        [
          {
            path: "/api/secret",
            method: "GET",
            type: "secure",
            handler: () => AppResponse.success({ secret: true }),
          },
        ],
        {
          name: "test",
          authHandler: () =>
            AppResponse.unauthenticated({ message: "No token" }),
        }
      );
      const res = await app.request("/api/secret");
      expect(res.status).toBe(401);
    });

    it("allows request when authHandler returns undefined", async () => {
      const app = await buildApp(
        [
          {
            path: "/api/secret",
            method: "GET",
            type: "secure",
            handler: () => AppResponse.success({ ok: true }),
          },
        ],
        {
          name: "test",
          authHandler: () => undefined,
        }
      );
      const res = await app.request("/api/secret");
      expect(res.status).toBe(200);
    });
  });

  describe("Zod validation via validator field", () => {
    it("populates req.errors when validation fails", async () => {
      let capturedErrors: AppRequest["errors"] | undefined;

      const app = await buildApp([
        {
          path: "/api/posts",
          method: "POST",
          type: "open",
          validator: { title: z.string().min(3) },
          handler: (req: AppRequest) => {
            capturedErrors = req.errors;
            return AppResponse.success({});
          },
        },
      ]);

      await app.request("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "ab" }),
      });

      expect(capturedErrors?.hasError).toBe(true);
      expect(capturedErrors?.errorFields).toContain("title");
    });

    it("req.errors is empty when validation passes", async () => {
      let capturedErrors: AppRequest["errors"] | undefined;

      const app = await buildApp([
        {
          path: "/api/posts",
          method: "POST",
          type: "open",
          validator: { title: z.string().min(3) },
          handler: (req: AppRequest) => {
            capturedErrors = req.errors;
            return AppResponse.success({});
          },
        },
      ]);

      await app.request("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Hello" }),
      });

      expect(capturedErrors?.hasError).toBe(false);
    });

    it("autoThrowValidationErrors returns 422 on failure", async () => {
      const app = await buildApp(
        [
          {
            path: "/api/posts",
            method: "POST",
            type: "open",
            validator: { title: z.string() },
            handler: () => AppResponse.success({}),
          },
        ],
        { name: "test", autoThrowValidationErrors: "laravel" }
      );

      const res = await app.request("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: 123 }),
      });

      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json).toHaveProperty("errors");
    });
  });

  describe("consoleLog", () => {
    it("logs to console when consoleLog is true", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});

      const app = await buildApp(
        [
          {
            path: "/api/ping",
            method: "GET",
            type: "open",
            handler: () => AppResponse.success({}),
          },
        ],
        { name: "test", consoleLog: true }
      );

      await app.request("/api/ping");
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("GET /api/ping")
      );
      spy.mockRestore();
    });

    it("does not log when consoleLog is false", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});

      const app = await buildApp(
        [
          {
            path: "/api/ping",
            method: "GET",
            type: "open",
            handler: () => AppResponse.success({}),
          },
        ],
        { name: "test", consoleLog: false }
      );

      await app.request("/api/ping");
      const simapiLog = spy.mock.calls.find((c) =>
        String(c[0]).includes("GET /api/ping")
      );
      expect(simapiLog).toBeUndefined();
      spy.mockRestore();
    });
  });
});
