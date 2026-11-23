import pg from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createDb, sessions, users, verifications } from "@magnisale/db";
import { TEST_DATABASE_URL, TEST_OWNER_DATABASE_URL, truncateAll } from "@magnisale/db/testing";
import { createBoss, sendJob, workJob } from "@magnisale/queue";
import { sweepExpiredAuth } from "../src/jobs/system/auth-sweep.js";

const owner = new pg.Pool({ connectionString: TEST_OWNER_DATABASE_URL });
const { db, pool } = createDb(TEST_DATABASE_URL);

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 3_600_000);

beforeEach(async () => {
  await truncateAll(owner);
  const [user] = await db.insert(users).values({ name: "Ada", email: "ada@example.com" }).returning({ id: users.id });
  await db.insert(sessions).values([
    { token: "expired", userId: user!.id, expiresAt: hoursFromNow(-1) },
    { token: "live", userId: user!.id, expiresAt: hoursFromNow(1) },
  ]);
  await db.insert(verifications).values([
    { identifier: "old", value: "x", expiresAt: hoursFromNow(-1) },
    { identifier: "new", value: "x", expiresAt: hoursFromNow(1) },
  ]);
});

afterAll(async () => {
  await truncateAll(owner);
  await Promise.all([owner.end(), pool.end()]);
});

describe("auth sweep", () => {
  it("removes only what has expired", async () => {
    expect(await sweepExpiredAuth(db)).toEqual({ sessions: 1, verifications: 1 });
    expect((await db.select().from(sessions)).map((s) => s.token)).toEqual(["live"]);
    expect((await db.select().from(verifications)).map((v) => v.identifier)).toEqual(["new"]);
  });

  it("runs through the real queue as the app role", async () => {
    const boss = createBoss(TEST_DATABASE_URL, "worker");
    boss.on("error", () => undefined);
    await boss.start();
    try {
      const done = new Promise<void>((resolve, reject) => {
        void workJob(boss, "system.auth-sweep", async () => {
          try {
            await sweepExpiredAuth(db);
            resolve();
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        });
      });
      expect(await sendJob(boss, "system.auth-sweep", {})).toBeTruthy();
      await done;
      expect((await db.select().from(sessions)).map((s) => s.token)).toEqual(["live"]);
    } finally {
      await boss.stop({ graceful: false });
    }
  });
});
