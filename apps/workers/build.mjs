import { fileURLToPath } from "node:url";
import { buildNodeApp } from "@magnisale/config/build-node";

await buildNodeApp({
  root: fileURLToPath(new URL(".", import.meta.url)),
  entries: ["src/index.ts", "src/migrate.ts"],
  // Read from disk by the migrate step.
  copy: { "../../packages/db/migrations": "migrations" },
});
