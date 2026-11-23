import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { companies, companyAssets, createDb, profileSections, withCompany } from "../src/index.js";
import { TEST_DATABASE_URL, TEST_OWNER_DATABASE_URL, truncateAll } from "../src/testing.js";

const owner = new pg.Pool({ connectionString: TEST_OWNER_DATABASE_URL });
const { db, pool } = createDb(TEST_DATABASE_URL);
let alpha: string;
let beta: string;

const section = (companyId: string) => ({ companyId, section: "story", schemaVersion: 1, data: { note: companyId } });

beforeAll(async () => {
  await truncateAll(owner);
});
afterAll(async () => {
  await truncateAll(owner);
  await Promise.all([owner.end(), pool.end()]);
});
beforeEach(async () => {
  await truncateAll(owner);
  const [a, b] = await db
    .insert(companies)
    .values([
      { name: "Alpha", slug: "alpha" },
      { name: "Beta", slug: "beta" },
    ])
    .returning({ id: companies.id });
  alpha = a!.id;
  beta = b!.id;
  await withCompany(db, alpha, (tx) => tx.insert(profileSections).values(section(alpha)));
  await withCompany(db, beta, (tx) => tx.insert(profileSections).values(section(beta)));
});

describe("row-level security", () => {
  it("connects as a role that cannot bypass it", async () => {
    const { rows } = await pool.query("select rolsuper, rolbypassrls from pg_roles where rolname = current_user");
    expect(rows[0]).toEqual({ rolsuper: false, rolbypassrls: false });
  });

  it("returns nothing without a company context", async () => {
    expect(await db.select().from(profileSections)).toHaveLength(0);
    expect(await db.select().from(companyAssets)).toHaveLength(0);
  });

  it("shows only the current company, even with no where clause", async () => {
    const rows = await withCompany(db, alpha, (tx) => tx.select().from(profileSections));
    expect(rows.map((r) => r.companyId)).toEqual([alpha]);
  });

  it("cannot write a row for another company", async () => {
    await expect(withCompany(db, alpha, (tx) => tx.insert(profileSections).values({ ...section(beta), section: "goals" }))).rejects.toThrow();
  });

  it("cannot write outside a company context", async () => {
    await expect(db.insert(profileSections).values({ ...section(alpha), section: "goals" })).rejects.toThrow();
  });

  it("cannot update or delete another company's rows", async () => {
    await withCompany(db, alpha, async (tx) => {
      await tx.update(profileSections).set({ data: { hacked: true } });
      await tx.delete(profileSections);
    });
    const { rows } = await owner.query("select data from profile_sections where company_id = $1", [beta]);
    expect(rows).toEqual([{ data: { note: beta } }]);
  });

  it("does not leak the context to the next query on a pooled connection", async () => {
    await withCompany(db, alpha, (tx) => tx.select().from(profileSections));
    const results = await Promise.all(Array.from({ length: 20 }, () => db.select().from(profileSections)));
    expect(results.every((rows) => rows.length === 0)).toBe(true);
  });

  it("still cascades when a company is deleted", async () => {
    const { eq } = await import("drizzle-orm");
    await db.delete(companies).where(eq(companies.id, alpha));
    const { rows } = await owner.query("select company_id from profile_sections");
    expect(rows).toEqual([{ company_id: beta }]);
  });
});
