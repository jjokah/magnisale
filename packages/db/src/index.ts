import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { COMPANY_SETTING } from "./schema/columns.js";
import * as schema from "./schema/index.js";

export * from "./schema/index.js";
export { schema };

export function createDb(connectionString: string) {
  const pool = new pg.Pool({ connectionString, max: 10 });
  const db = drizzle(pool, { schema });
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Scopes the current transaction to one company. Prefer `withCompany`. */
export async function setCompany(tx: Tx, companyId: string): Promise<void> {
  await tx.execute(sql`select set_config(${COMPANY_SETTING}, ${companyId}, true)`);
}

/**
 * Runs `fn` in a transaction scoped to one company. Tables with a `company_id`
 * have row-level security, so inside `fn` only that company's rows exist, and
 * outside any `withCompany` none do. The setting is transaction-local, so it
 * cannot leak to the next user of a pooled connection.
 */
export async function withCompany<T>(db: Db, companyId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await setCompany(tx, companyId);
    return fn(tx);
  });
}
