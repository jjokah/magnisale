import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";
import * as schema from "./schema.js";

export function createDb(connectionString: string) {
  const pool = new pg.Pool({ connectionString, max: 10 });
  const db = drizzle(pool, { schema });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** `src/db/migrations` in development, `dist/migrations` beside the bundle. */
function migrationsFolder(): string {
  const bundled = fileURLToPath(new URL("./migrations", import.meta.url));
  if (existsSync(bundled)) return bundled;
  throw new Error(`Migrations not found at ${bundled}`);
}

export async function runMigrations(db: Db): Promise<void> {
  await migrate(db, { migrationsFolder: migrationsFolder() });
}
