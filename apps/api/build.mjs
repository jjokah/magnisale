import { fileURLToPath } from "node:url";
import { buildNodeApp } from "@magnisale/config/build-node";

await buildNodeApp({
  root: fileURLToPath(new URL(".", import.meta.url)),
  entries: ["src/index.ts"],
  external: ["sharp"],
});
