// Bundles a server app into dist/. Workspace packages are TypeScript source, so
// everything is compiled in. Packages with native code stay external, and
// dist/package.json lists them for the image to install.
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { build } from "esbuild";

export async function buildNodeApp({ root, entries, external = [], copy = {} }) {
  const dist = join(root, "dist");
  await rm(dist, { recursive: true, force: true });

  await build({
    entryPoints: entries.map((entry) => join(root, entry)),
    outdir: dist,
    outbase: join(root, "src"),
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node24",
    sourcemap: true,
    logLevel: "warning",
    // pg's optional native driver is never installed.
    external: [...external, "pg-native"],
    // Bundled CommonJS packages still call require().
    banner: {
      js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
    },
  });

  const dependencies = {};
  for (const name of external) {
    const manifest = JSON.parse(await readFile(join(root, "node_modules", name, "package.json"), "utf8"));
    dependencies[name] = manifest.version;
  }
  await writeFile(
    join(dist, "package.json"),
    `${JSON.stringify({ private: true, type: "module", dependencies }, null, 2)}\n`,
  );

  for (const [from, to] of Object.entries(copy)) {
    await cp(join(root, from), join(dist, to), { recursive: true });
  }
}
