import pg from "pg";
import { PgBoss } from "pg-boss";
import { z } from "zod";

const SCHEMA = "pgboss";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// pg-boss keeps finished jobs for a while. Job data is kept to IDs, so nothing a
// customer gave us outlives the promise to delete raw input.
const KEEP_FINISHED_SECONDS = 7 * 24 * 60 * 60;

export const JOBS = {
  /** Clears expired sessions and verification tokens. */
  "system.auth-sweep": { payload: z.object({}).strict(), cron: "0 3 * * *" },
} as const;

export type JobName = keyof typeof JOBS;
export type JobPayload<N extends JobName> = z.infer<(typeof JOBS)[N]["payload"]>;

export const JOB_NAMES = Object.keys(JOBS) as JobName[];

/** Refuses job data that is anything other than IDs. */
export function assertIdsOnly(payload: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value !== "string" || !UUID.test(value)) {
      throw new Error(`Job data must be IDs only, but "${key}" is not one.`);
    }
  }
}

export function createBoss(connectionString: string, role: "worker" | "sender"): PgBoss {
  return new PgBoss({
    connectionString,
    schema: SCHEMA,
    // Installed once by the migrate step, as the database owner.
    migrate: false,
    createSchema: false,
    supervise: role === "worker",
    schedule: role === "worker",
  });
}

export async function sendJob<N extends JobName>(boss: PgBoss, name: N, payload: JobPayload<N>): Promise<string | null> {
  const data = JOBS[name].payload.parse(payload) as Record<string, unknown>;
  assertIdsOnly(data);
  return boss.send(name, data);
}

export async function workJob<N extends JobName>(
  boss: PgBoss,
  name: N,
  handler: (payload: JobPayload<N>) => Promise<void>,
): Promise<string> {
  return boss.work<JobPayload<N>>(name, async (jobs) => {
    for (const job of jobs) {
      await handler(JOBS[name].payload.parse(job.data) as JobPayload<N>);
    }
  });
}

/**
 * Creates pg-boss's schema, queues and schedules as the owner, then grants the
 * app role only what it needs to run jobs.
 */
export async function installQueues({ ownerUrl, appRole }: { ownerUrl: string; appRole: string }): Promise<void> {
  const boss = new PgBoss({
    connectionString: ownerUrl,
    schema: SCHEMA,
    migrate: true,
    createSchema: true,
    supervise: false,
    schedule: false,
  });
  boss.on("error", (error) => console.error("pg-boss:", error));
  await boss.start();
  try {
    for (const name of JOB_NAMES) {
      if (!(await boss.getQueue(name))) {
        await boss.createQueue(name, { deleteAfterSeconds: KEEP_FINISHED_SECONDS, retryLimit: 3, retryBackoff: true });
      }
      const { cron } = JOBS[name];
      if (cron) await boss.schedule(name, cron, {}, { tz: "UTC" });
    }
  } finally {
    await boss.stop({ graceful: false });
  }

  const client = new pg.Client({ connectionString: ownerUrl });
  await client.connect();
  try {
    const role = client.escapeIdentifier(appRole);
    const schema = client.escapeIdentifier(SCHEMA);
    await client.query(`grant usage on schema ${schema} to ${role}`);
    await client.query(`grant select, insert, update, delete on all tables in schema ${schema} to ${role}`);
    await client.query(`grant usage, select on all sequences in schema ${schema} to ${role}`);
    await client.query(`grant execute on all functions in schema ${schema} to ${role}`);
  } finally {
    await client.end();
  }
}

export type { PgBoss };
