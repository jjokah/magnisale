// Bundles the API into dist/index.js. npm packages stay external and are
// installed in the image; the workspace's profile package is TypeScript source,
// so it is compiled into the bundle.
import { cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const profile = fileURLToPath(new URL("../../../packages/profile/src/index.ts", import.meta.url));

await rm(`${root}dist`, { recursive: true, force: true });

await build({
  entryPoints: [`${root}src/index.ts`],
  outfile: `${root}dist/index.js`,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  packages: "external",
  alias: { "@magnisale/profile": profile },
  sourcemap: true,
  logLevel: "info",
});

// Read from disk at start-up, next to the bundle.
await cp(`${root}src/db/migrations`, `${root}dist/migrations`, { recursive: true });
