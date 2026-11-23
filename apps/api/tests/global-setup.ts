import pg from "pg";
import { TEST_DATABASE_URL } from "./helpers.js";

/** Creates the test database if it is not there yet. Migrations run in buildApp. */
export default async function setup(): Promise<void> {
  const url = new URL(TEST_DATABASE_URL);
  const name = url.pathname.slice(1);
  url.pathname = "/postgres";

  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query("select 1 from pg_database where datname = $1", [name]);
    if (!rowCount) await client.query(`create database "${name.replaceAll('"', '""')}"`);
  } finally {
    await client.end();
  }
}
