import pg from "pg";
import { runMigrations } from "./migrate.js";

/** Tests connect as the app role, so row-level security applies as in production. */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://magnisale_app:magnisale_app@localhost:5433/magnisale_test";

/** For setting up and inspecting state from outside row-level security. */
export const TEST_OWNER_DATABASE_URL =
  process.env.TEST_OWNER_DATABASE_URL ?? "postgres://magnisale:magnisale@localhost:5433/magnisale_test";

/** Creates the test database if needed and applies migrations. */
export async function prepareTestDatabase(): Promise<void> {
  const url = new URL(TEST_OWNER_DATABASE_URL);
  const name = url.pathname.slice(1);
  url.pathname = "/postgres";

  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    const { rowCount } = await admin.query("select 1 from pg_database where datname = $1", [name]);
    if (!rowCount) await admin.query(`create database ${admin.escapeIdentifier(name)}`);
  } finally {
    await admin.end();
  }
  await runMigrations({ ownerUrl: TEST_OWNER_DATABASE_URL, appPassword: new URL(TEST_DATABASE_URL).password });
}

export async function truncateAll(owner: pg.Pool): Promise<void> {
  await owner.query("truncate users, companies, verifications, rate_limits cascade");
}
