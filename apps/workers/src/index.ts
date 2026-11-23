import { createDb } from "@magnisale/db";
import { createBoss, workJob } from "@magnisale/queue";
import { sweepExpiredAuth } from "./jobs/system/auth-sweep.js";

const DEV_DATABASE_URL = "postgres://magnisale_app:magnisale_app@localhost:5433/magnisale";

const url = process.env.DATABASE_URL ?? (process.env.NODE_ENV === "production" ? null : DEV_DATABASE_URL);
if (!url) throw new Error("DATABASE_URL must be set in production.");

const { db, pool } = createDb(url);
const boss = createBoss(url, "worker");
boss.on("error", (error) => console.error("pg-boss:", error));

await boss.start();
await workJob(boss, "system.auth-sweep", async () => {
  const removed = await sweepExpiredAuth(db);
  console.info(`Auth sweep removed ${removed.sessions} session(s) and ${removed.verifications} token(s).`);
});
console.info("Workers started.");

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void boss
      .stop({ graceful: true, timeout: 20_000 })
      .then(() => pool.end())
      .then(() => process.exit(0));
  });
}
