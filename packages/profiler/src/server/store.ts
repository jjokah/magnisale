import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { profileSections, withCompany, type Db, type Tx } from "@magnisale/db";
import {
  PROFILE_SCHEMA_VERSION,
  SECTION_IDS,
  type FieldDef,
  type SectionId,
  type Source,
} from "../fields.js";
import {
  applyFieldValue,
  type CollectionItem,
  type CollectionItemInput,
  type FieldValue,
  type ProfileView,
  type SectionData,
} from "../values.js";

export function ownerSource(): Source {
  return { kind: "owner", label: "You", at: new Date().toISOString() };
}

/** Lays out an empty profile. Runs inside the transaction that creates the company. */
export async function seedProfile(tx: Tx, companyId: string, name: string): Promise<void> {
  await tx.insert(profileSections).values(
    SECTION_IDS.map((section) => ({
      companyId,
      section,
      schemaVersion: PROFILE_SCHEMA_VERSION,
      data: section === "identity" ? { brandName: { value: name, source: ownerSource() } } : {},
    })),
  );
}

export async function readProfile(db: Db, companyId: string): Promise<ProfileView> {
  const rows = await withCompany(db, companyId, (tx) => tx.select().from(profileSections));
  const sections = Object.fromEntries(SECTION_IDS.map((id) => [id, {}])) as Record<SectionId, SectionData>;
  let updatedAt: Date | null = null;
  for (const row of rows) {
    if (row.section in sections) sections[row.section as SectionId] = row.data as SectionData;
    if (!updatedAt || row.updatedAt > updatedAt) updatedAt = row.updatedAt;
  }
  return { schemaVersion: PROFILE_SCHEMA_VERSION, sections, updatedAt: updatedAt?.toISOString() ?? null };
}

/**
 * Writes one field inside a company-scoped transaction. The row is locked for
 * the read-modify-write, so two saves to different fields of a section cannot
 * overwrite each other.
 */
export async function writeFieldInTx(
  tx: Tx,
  companyId: string,
  def: FieldDef,
  value: Exclude<FieldValue, CollectionItem[]> | CollectionItemInput[] | null,
  source: Source,
): Promise<SectionData> {
  const where = and(eq(profileSections.companyId, companyId), eq(profileSections.section, def.section));
  const [row] = await tx.select().from(profileSections).where(where).for("update");
  if (!row) throw new Error(`Profile section ${def.section} is missing for company ${companyId}`);

  const data = applyFieldValue(row.data as SectionData, def, value, source, randomUUID);
  await tx
    .update(profileSections)
    .set({ data, schemaVersion: PROFILE_SCHEMA_VERSION, updatedAt: new Date() })
    .where(where);
  return data;
}

export async function writeField(
  db: Db,
  companyId: string,
  def: FieldDef,
  value: Exclude<FieldValue, CollectionItem[]> | CollectionItemInput[] | null,
  source: Source,
): Promise<SectionData> {
  return withCompany(db, companyId, (tx) => writeFieldInTx(tx, companyId, def, value, source));
}
