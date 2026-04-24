import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import consola from "consola";
import { parse } from "yaml";
import { buildEndpoint } from "./endpoint.js";
import { fakerValueFromSchema } from "./faker.js";
import type { CodegenContext, OASpec } from "./types.js";
import { getFileName } from "./utils.js";
import { zodFromSchema } from "./zod.js";

export async function runImportOpenAPI(
  specPath: string,
  cwd?: string,
  opts: { output?: string } = {}
): Promise<void> {
  const root = resolve(cwd ?? process.cwd());
  const absSpec = resolve(root, specPath);
  const outputBase = resolve(root, opts.output ?? "src");
  const endpointsDir = join(outputBase, "endpoints");
  const modelsDir = join(outputBase, "models");
  const requestsDir = join(outputBase, "requests");

  let raw: string;
  try {
    raw = readFileSync(absSpec, "utf8");
  } catch (err) {
    consola.error(`[SimAPI] Cannot read spec: ${absSpec}`);
    throw err;
  }

  const spec = parse(raw) as OASpec;

  // 1. Generate Models
  generateModels(spec, modelsDir);

  // 2. Prepare Endpoints & Requests
  const groups = new Map<string, { endpoints: string[]; requests: string[] }>();
  const requestImports = new Map<string, Set<string>>();
  const modelImports = new Map<string, Set<string>>();
  const existingNames = new Set<string>();

  for (const [path, pathObj] of Object.entries(spec.paths ?? {})) {
    if (!pathObj) continue;

    const methods = [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head",
    ];
    for (const m of methods) {
      // biome-ignore lint/suspicious/noExplicitAny: OpenAPI methods are dynamic
      const op = (pathObj as any)[m];
      if (!op) continue;

      const fileName = getFileName(path, op);
      if (!groups.has(fileName)) {
        groups.set(fileName, { endpoints: [], requests: [] });
      }
      const group = groups.get(fileName);
      if (!group) continue;

      const ctx: CodegenContext = { spec, usedModels: new Set() };
      // biome-ignore lint/suspicious/noExplicitAny: OpenAPI path items have complex unions
      const pathItem = pathObj as any;
      const { code, requestBlock, requestName, usedModels } = buildEndpoint(
        m,
        path,
        op,
        pathItem.parameters,
        ctx,
        existingNames
      );

      group.endpoints.push(code);
      if (requestBlock && requestName) {
        group.requests.push(requestBlock);
        if (!requestImports.has(fileName))
          requestImports.set(fileName, new Set());
        requestImports.get(fileName)?.add(requestName);
      }

      if (usedModels.size > 0) {
        if (!modelImports.has(fileName)) modelImports.set(fileName, new Set());
        const imports = modelImports.get(fileName);
        if (imports) {
          for (const model of usedModels) {
            imports.add(model);
          }
        }
      }
    }
  }

  let written = 0;
  mkdirSync(endpointsDir, { recursive: true });
  mkdirSync(requestsDir, { recursive: true });

  // 3. Write Request files
  for (const [fileName, group] of groups.entries()) {
    if (group.requests.length === 0) continue;

    const models = modelImports.get(fileName);
    const imports = [
      'import { z, type RequestDefinition } from "@simapi/simapi";',
    ];
    if (models) {
      for (const m of Array.from(models).sort()) {
        imports.push(`import { ${m}Schema } from "../models/${m}.js";`);
      }
    }

    const content = `${imports.join("\n")}\n\n${group.requests.join("\n\n")}\n`;
    writeFileSync(join(requestsDir, `${fileName}.ts`), content, "utf8");
    consola.log(
      `[SimAPI] Wrote requests ${join(requestsDir, `${fileName}.ts`)}`
    );
  }

  // 4. Write Endpoint files
  for (const [fileName, group] of groups.entries()) {
    const reqNames = requestImports.get(fileName);
    const models = modelImports.get(fileName);
    const needsFaker = group.endpoints.some((e) => e.includes("faker."));
    const imports = [
      `import { AppResponse, AppRequest${needsFaker ? ", faker" : ""}, type EndpointDefinition } from "@simapi/simapi";`,
    ];

    if (reqNames && reqNames.size > 0) {
      const names = Array.from(reqNames).sort().join(", ");
      imports.push(`import { ${names} } from "../requests/${fileName}.js";`);
    }

    if (models) {
      for (const m of Array.from(models).sort()) {
        imports.push(`import { make${m} } from "../models/${m}.js";`);
      }
    }

    const content = `${imports.join("\n")}\n\n${group.endpoints.join("\n\n")}\n`;
    writeFileSync(join(endpointsDir, `${fileName}.ts`), content, "utf8");
    consola.log(
      `[SimAPI] Wrote endpoints ${join(endpointsDir, `${fileName}.ts`)}`
    );
    written++;
  }

  consola.success(
    `[SimAPI] Import complete — ${written} file(s) written to ${endpointsDir}/`
  );
}

function generateModels(spec: OASpec, modelsDir: string): void {
  if (!spec.components?.schemas) return;

  mkdirSync(modelsDir, { recursive: true });

  for (const [name, schema] of Object.entries(spec.components.schemas)) {
    const ctx: CodegenContext = { spec, usedModels: new Set() };
    const zodSchema = zodFromSchema(schema, ctx);
    const fakerStub = fakerValueFromSchema(schema, spec);

    // Filter out self-reference if it exists
    ctx.usedModels.delete(name);

    const imports: string[] = [];
    for (const used of Array.from(ctx.usedModels).sort()) {
      imports.push(
        `import { ${used}Schema, make${used} } from "./${used}.js";`
      );
    }

    const content = `import { z, faker } from "@simapi/simapi";
${imports.join("\n")}

export const ${name}Schema = ${zodSchema};

export type ${name} = z.infer<typeof ${name}Schema>;

export const make${name} = (overrides?: Partial<${name}>): ${name} => ({
${fakerStub
  .slice(2, -2)
  .split("\n")
  .map((l) => `  ${l.trim()}`)
  .filter((l) => l.trim().length > 0)
  .join("\n")},
  ...overrides,
});`;

    const outPath = join(modelsDir, `${name}.ts`);
    writeFileSync(outPath, content, "utf8");
    consola.log(`[SimAPI] Wrote model ${outPath}`);
  }
}
