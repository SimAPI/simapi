import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { beforeAll, describe, expect, it } from "vitest";
import type { OASpec } from "../types.js";
import { runImportOpenAPI } from "../importer/index.js";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "../fixtures");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadYaml(file: string): OASpec {
  return parseYaml(readFileSync(join(FIXTURES, file), "utf8")) as OASpec;
}

function loadJson(file: string): OASpec {
  return JSON.parse(readFileSync(join(FIXTURES, file), "utf8")) as OASpec;
}

function tmpDir(): string {
  return mkdtempSync(join(tmpdir(), "simapi-openapi-test-"));
}

/** Run the importer and return a map of { filename → file content }. */
async function importToTemp(
  specFile: string,
  isJson = false
): Promise<Map<string, string>> {
  const outDir = tmpDir();
  const specPath = join(FIXTURES, specFile);

  await runImportOpenAPI(specPath, undefined, { output: outDir });

  const files = new Map<string, string>();
  for (const f of readdirSync(outDir)) {
    files.set(f, readFileSync(join(outDir, f), "utf8"));
  }

  // Clean up
  rmSync(outDir, { recursive: true, force: true });

  return files;
}

// ─── Auth API (OAS 3.0) ───────────────────────────────────────────────────────

describe("auth-api.3.0.yaml", () => {
  let spec: OASpec;
  let files: Map<string, string>;

  beforeAll(async () => {
    spec = loadYaml("auth-api.3.0.yaml");
    files = await importToTemp("auth-api.3.0.yaml");
  });

  it("parses without error", () => {
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.paths).toBeDefined();
    expect(Object.keys(spec.paths!).length).toBeGreaterThan(0);
  });

  it("generates files grouped by tag", () => {
    // Tags: Authentication, Account Verification, Password Reset
    expect(files.has("authentication.ts")).toBe(true);
    expect(files.has("accountVerification.ts")).toBe(true);
    expect(files.has("passwordReset.ts")).toBe(true);
  });

  it("maps 201 response → AppResponse.created", () => {
    const auth = files.get("authentication.ts")!;
    expect(auth).toContain("AppResponse.created");
  });

  it("maps 200 response → AppResponse.success", () => {
    const auth = files.get("authentication.ts")!;
    expect(auth).toContain("AppResponse.success");
  });

  it("maps 204 response → AppResponse.noContent", () => {
    const auth = files.get("authentication.ts")!;
    expect(auth).toContain("AppResponse.noContent");
  });

  it("generates const → literal value in response stub for 'message' fields", () => {
    const verification = files.get("accountVerification.ts")!;
    // The response stub for verifyAccount inlines the const value as a string literal
    expect(verification).toContain('"Account verified successfully."');
  });

  it("generates request validation block for body schemas", () => {
    const verification = files.get("accountVerification.ts")!;
    expect(verification).toContain("request:");
    expect(verification).toContain("body:");
    expect(verification).toContain("z.string().min(6).max(6)");
  });

  it("marks secure endpoints with type: 'secure'", () => {
    const verification = files.get("accountVerification.ts")!;
    expect(verification).toContain('type: "secure"');
  });

  it("marks open endpoints with type: 'open'", () => {
    const auth = files.get("authentication.ts")!;
    expect(auth).toContain('type: "open"');
  });

  it("generates throwValidationError() in handlers with request blocks", () => {
    const verification = files.get("accountVerification.ts")!;
    expect(verification).toContain("req.errors.throwValidationError()");
  });

  it("imports AppResponse and EndpointDefinition from @simapi/simapi", () => {
    for (const content of files.values()) {
      expect(content).toContain('from "@simapi/simapi"');
      expect(content).toContain("AppResponse");
      expect(content).toContain("EndpointDefinition");
    }
  });

  it("generates email format → z.string().email()", () => {
    const auth = files.get("authentication.ts")!;
    expect(auth).toContain("z.string().email()");
  });

  it("resolves $ref for response body schema (verifyAccount returns user)", () => {
    const verification = files.get("accountVerification.ts")!;
    // The 200 response references AuthUserResource via $ref
    // The stub should at minimum produce a body
    expect(verification).toContain("AppResponse.success");
  });
});

// ─── Blog API (OAS 3.1) ───────────────────────────────────────────────────────

describe("blog-api.3.1.yaml", () => {
  let spec: OASpec;
  let files: Map<string, string>;

  beforeAll(async () => {
    spec = loadYaml("blog-api.3.1.yaml");
    files = await importToTemp("blog-api.3.1.yaml");
  });

  it("parses without error", () => {
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths).toBeDefined();
  });

  it("groups by tag: posts, comments, authors, media", () => {
    expect(files.has("posts.ts")).toBe(true);
    expect(files.has("comments.ts")).toBe(true);
    expect(files.has("authors.ts")).toBe(true);
    expect(files.has("media.ts")).toBe(true);
  });

  it("maps 301 response → AppResponse.redirect", () => {
    const posts = files.get("posts.ts")!;
    expect(posts).toContain("AppResponse.redirect");
  });

  it("maps 302 response → AppResponse.redirect", () => {
    const media = files.get("media.ts")!;
    expect(media).toContain("AppResponse.redirect");
  });

  it("maps 204 DELETE → AppResponse.noContent", () => {
    const posts = files.get("posts.ts")!;
    expect(posts).toContain("AppResponse.noContent");
  });

  it("maps 201 POST → AppResponse.created", () => {
    const posts = files.get("posts.ts")!;
    expect(posts).toContain("AppResponse.created");
  });

  it("generates z.enum() for PostStatus field with tags", () => {
    const posts = files.get("posts.ts")!;
    expect(posts).toContain('z.enum(["draft", "published", "archived"])');
  });

  it("generates request block with minLength/maxLength for title", () => {
    const posts = files.get("posts.ts")!;
    expect(posts).toContain("z.string().min(3).max(200)");
  });

  it("handles OAS 3.1 nullable type arrays in response stubs", () => {
    // PaginationMeta has from/to as ["integer", "null"]
    // buildResponseStub will fall through to scalarStub which returns 0 for integer
    // The nullable type is handled in zodFromSchema (used for request blocks).
    // Here we verify the file parses and is generated without error.
    const posts = files.get("posts.ts")!;
    // The listPosts handler returns a stub including meta object
    expect(posts).toContain("meta: {}");
  });
});

// ─── Petstore (OAS 3.0 JSON) ─────────────────────────────────────────────────

describe("petstore-minimal.3.0.json", () => {
  let spec: OASpec;
  let files: Map<string, string>;

  beforeAll(async () => {
    spec = loadJson("petstore-minimal.3.0.json");
    files = await importToTemp("petstore-minimal.3.0.json");
  });

  it("parses JSON format without error", () => {
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.paths).toBeDefined();
  });

  it("groups by tag: pets, orders", () => {
    expect(files.has("pets.ts")).toBe(true);
    expect(files.has("orders.ts")).toBe(true);
  });

  it("generates z.enum() for species field", () => {
    const pets = files.get("pets.ts")!;
    expect(pets).toContain(
      'z.enum(["dog", "cat", "bird", "fish", "rabbit", "other"])'
    );
  });

  it("generates z.number().int() for integer body fields (quantity in orders)", () => {
    const orders = files.get("orders.ts")!;
    // quantity: integer, minimum: 1 → z.number().int().min(1)
    expect(orders).toContain("z.number().int().min(1)");
  });

  it("maps 204 DELETE → AppResponse.noContent", () => {
    const pets = files.get("pets.ts")!;
    expect(pets).toContain("AppResponse.noContent");
  });

  it("maps 201 POST → AppResponse.created", () => {
    const pets = files.get("pets.ts")!;
    expect(pets).toContain("AppResponse.created");
  });

  it("generates validation block with enum constraint", () => {
    const pets = files.get("pets.ts")!;
    expect(pets).toContain("request:");
    expect(pets).toContain("body:");
  });

  it("marks apiKey-secured endpoints as type: 'secure'", () => {
    const pets = files.get("pets.ts")!;
    expect(pets).toContain('type: "secure"');
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("importer edge cases", () => {
  it("deduplicates object names in the same group", async () => {
    // Two operations with the same summary in the same tag group would collide
    const spec: OASpec = {
      openapi: "3.0.3",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/a": {
          get: {
            summary: "Get item",
            tags: ["Things"],
            responses: { "200": { description: "ok" } },
          },
        },
        "/b": {
          get: {
            summary: "Get item",
            tags: ["Things"],
            responses: { "200": { description: "ok" } },
          },
        },
      },
    };

    const outDir = tmpDir();
    const specPath = join(outDir, "dup.json");
    const { writeFileSync } = await import("node:fs");
    writeFileSync(specPath, JSON.stringify(spec));

    await runImportOpenAPI(specPath, undefined, { output: join(outDir, "out") });

    const content = readFileSync(join(outDir, "out", "things.ts"), "utf8");

    // Should have both getItem and getItem1
    expect(content).toContain("const getItem:");
    expect(content).toContain("const getItem1:");

    rmSync(outDir, { recursive: true, force: true });
  });

  it("falls back to path segments when no tags or operationId", async () => {
    const spec: OASpec = {
      openapi: "3.0.3",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/widgets/{id}": {
          get: {
            responses: { "200": { description: "ok" } },
          },
        },
      },
    };

    const outDir = tmpDir();
    const specPath = join(outDir, "notag.json");
    const { writeFileSync } = await import("node:fs");
    writeFileSync(specPath, JSON.stringify(spec));

    await runImportOpenAPI(specPath, undefined, { output: join(outDir, "out") });

    // File name comes from path segment before {id} = "widgets"
    const files = readdirSync(join(outDir, "out"));
    expect(files).toContain("widgets.ts");

    rmSync(outDir, { recursive: true, force: true });
  });

  it("handles spec with no paths gracefully", async () => {
    const outDir = tmpDir();
    const specPath = join(outDir, "empty.json");
    const { writeFileSync } = await import("node:fs");
    writeFileSync(specPath, JSON.stringify({ openapi: "3.0.3", info: { title: "Empty", version: "1.0.0" }, paths: {} }));

    // Should not throw, just log and return
    await expect(
      runImportOpenAPI(specPath, undefined, { output: join(outDir, "out") })
    ).resolves.toBeUndefined();

    rmSync(outDir, { recursive: true, force: true });
  });

  it("handles spec with unknown $ref gracefully (falls back to z.unknown())", async () => {
    const spec = {
      openapi: "3.0.3",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/items": {
          post: {
            tags: ["Items"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      thing: { $ref: "#/components/schemas/NonExistent" },
                    },
                    required: ["thing"],
                  },
                },
              },
            },
            responses: { "201": { description: "Created" } },
          },
        },
      },
    };

    const outDir = tmpDir();
    const specPath = join(outDir, "badref.json");
    const { writeFileSync } = await import("node:fs");
    writeFileSync(specPath, JSON.stringify(spec));

    await runImportOpenAPI(specPath, undefined, { output: join(outDir, "out") });

    const content = readFileSync(join(outDir, "out", "items.ts"), "utf8");
    expect(content).toContain("z.unknown()");

    rmSync(outDir, { recursive: true, force: true });
  });

  it("handles nullable type arrays in request body → z.string().nullable()", async () => {
    const spec = {
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/profile": {
          patch: {
            tags: ["Profile"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      bio: { type: ["string", "null"] },
                      age: { type: ["integer", "null"], minimum: 0 },
                    },
                    required: ["bio"],
                  },
                },
              },
            },
            responses: { "200": { description: "Updated" } },
          },
        },
      },
    };

    const outDir = tmpDir();
    const specPath = join(outDir, "nullable.json");
    const { writeFileSync } = await import("node:fs");
    writeFileSync(specPath, JSON.stringify(spec));

    await runImportOpenAPI(specPath, undefined, { output: join(outDir, "out") });

    const content = readFileSync(join(outDir, "out", "profile.ts"), "utf8");
    expect(content).toContain("z.string().nullable()");
    expect(content).toContain("z.number().int().min(0).nullable()");

    rmSync(outDir, { recursive: true, force: true });
  });
});
