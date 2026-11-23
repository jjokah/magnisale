import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const eslint = new ESLint({ cwd: root });

async function restricted(filePath: string, code: string): Promise<boolean> {
  const [result] = await eslint.lintText(code, { filePath: `${root}${filePath}` });
  return result!.messages.some((m) => m.ruleId === "@typescript-eslint/no-restricted-imports");
}

const use = (statement: string, name: string) => `${statement}\nexport const value = ${name};\n`;

describe("import boundaries", () => {
  it.each([
    ["apps/platform/src/x.ts", "@magnisale/db"],
    ["apps/platform/src/x.ts", "@magnisale/queue"],
    ["apps/platform/src/x.ts", "@magnisale/auth"],
    ["apps/platform/src/x.ts", "@magnisale/integrations"],
    ["apps/platform/src/x.ts", "@magnisale/profiler/server"],
    ["apps/web/src/x.ts", "@magnisale/db"],
    ["apps/web/src/x.ts", "@magnisale/profiler/server"],
    ["packages/ui/src/x.ts", "@magnisale/db"],
  ])("%s cannot import %s", async (file, module) => {
    expect(await restricted(file, use(`import { thing } from "${module}";`, "thing"))).toBe(true);
  });

  it("lets the platform import only types from the API", async () => {
    const file = "apps/platform/src/x.ts";
    expect(await restricted(file, 'import type { AppType } from "@magnisale/api/types";\nexport type A = AppType;\n')).toBe(false);
    expect(await restricted(file, use('import { thing } from "@magnisale/api/types";', "thing"))).toBe(true);
  });

  it("stops apps importing each other", async () => {
    expect(await restricted("apps/workers/src/x.ts", use('import { thing } from "@magnisale/api/types";', "thing"))).toBe(true);
    expect(await restricted("apps/api/src/x.ts", use('import { thing } from "@magnisale/workers";', "thing"))).toBe(true);
  });

  it("allows the browser-safe profiler entry and the UI", async () => {
    expect(await restricted("apps/platform/src/x.ts", use('import { FIELDS } from "@magnisale/profiler";', "FIELDS"))).toBe(false);
    expect(await restricted("apps/web/src/x.ts", use('import { Button } from "@magnisale/ui";', "Button"))).toBe(false);
  });

  it("allows server packages in server apps", async () => {
    expect(await restricted("apps/api/src/x.ts", use('import { createDb } from "@magnisale/db";', "createDb"))).toBe(false);
    expect(await restricted("apps/workers/src/x.ts", use('import { createBoss } from "@magnisale/queue";', "createBoss"))).toBe(false);
  });
});
