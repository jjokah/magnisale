import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";
import pg from "pg";

/** The role the API and workers connect as. It cannot bypass row-level security. */
export const APP_ROLE = "magnisale_app";

// Serialises concurrent runs. The value is arbitrary but must stay the same.
const MIGRATION_LOCK = 7_211_904;

export interface MigrateOptions {
  /** Connects as the owner of the database. */
  ownerUrl: string;
  appPassword: string;
  migrationsFolder?: string;
}

export function defaultMigrationsFolder(): string {
  return process.env.MIGRATIONS_DIR ?? fileURLToPath(new URL("../migrations", import.meta.url));
}

/**
 * Applies migrations, then makes sure the application role exists with only the
 * rights it needs. Runs as a one-shot step before the API and workers start.
 */
export async function runMigrations({ ownerUrl, appPassword, migrationsFolder }: MigrateOptions): Promise<void> {
  const client = new pg.Client({ connectionString: ownerUrl });
  await client.connect();
  try {
    await client.query("select pg_advisory_lock($1)", [MIGRATION_LOCK]);
    await migrate(drizzle(client), { migrationsFolder: migrationsFolder ?? defaultMigrationsFolder() });

    const role = client.escapeIdentifier(APP_ROLE);
    const password = client.escapeLiteral(appPassword);
    const { rowCount } = await client.query("select 1 from pg_roles where rolname = $1", [APP_ROLE]);
    await client.query(
      rowCount
        ? `alter role ${role} login nosuperuser nobypassrls password ${password}`
        : `create role ${role} login nosuperuser nobypassrls password ${password}`,
    );
    await client.query(`grant usage on schema public to ${role}`);
    await client.query(`grant select, insert, update, delete on all tables in schema public to ${role}`);
    await client.query(`grant usage, select on all sequences in schema public to ${role}`);
  } finally {
    await client.query("select pg_advisory_unlock($1)", [MIGRATION_LOCK]).catch(() => undefined);
    await client.end();
  }
}
