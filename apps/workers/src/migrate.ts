// The one-shot step that runs before the API and workers start: database
// migrations, the app role, and pg-boss's schema and queues. Runs as the owner.
import { APP_ROLE, runMigrations } from "@magnisale/db/migrate";
import { installQueues } from "@magnisale/queue";

const production = process.env.NODE_ENV === "production";
const ownerUrl =
  process.env.OWNER_DATABASE_URL ?? (production ? null : "postgres://magnisale:magnisale@localhost:5433/magnisale");
const appPassword = process.env.APP_DB_PASSWORD ?? (production ? null : "magnisale_app");

if (!ownerUrl || !appPassword) {
  throw new Error("OWNER_DATABASE_URL and APP_DB_PASSWORD must be set in production.");
}

await runMigrations({ ownerUrl, appPassword });
await installQueues({ ownerUrl, appRole: APP_ROLE });
console.info("Migrations applied.");
