import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import {
  applyFieldValue,
  PROFILE_SCHEMA_VERSION,
  SECTION_IDS,
  type FieldDef,
  type FieldValue,
  type CollectionItem,
  type CollectionItemInput,
  type SectionData,
  type SectionId,
  type Source,
} from "@magnisale/profile";
import type { Db, Tx } from "../db/client.js";
import { memberships, organizations, profileSections } from "../db/schema.js";

export function ownerSource(): Source {
  return { kind: "owner", label: "You", at: new Date().toISOString() };
}

/** Creates the organisation, makes the user its owner and lays out an empty profile. */
export async function createOrganization(tx: Tx, userId: string, name: string): Promise<string> {
  const [org] = await tx.insert(organizations).values({ name }).returning({ id: organizations.id });
  const orgId = org!.id;
  await tx.insert(memberships).values({ userId, orgId, role: "owner" });
  await tx.insert(profileSections).values(
    SECTION_IDS.map((section) => ({
      orgId,
      section,
      schemaVersion: PROFILE_SCHEMA_VERSION,
      data: section === "identity" ? ({ brandName: { value: name, source: ownerSource() } } as SectionData) : {},
    })),
  );
  return orgId;
}

export interface ProfileView {
  schemaVersion: number;
  sections: Record<SectionId, SectionData>;
  updatedAt: string | null;
}

export async function readProfile(db: Db | Tx, orgId: string): Promise<ProfileView> {
  const rows = await db.select().from(profileSections).where(eq(profileSections.orgId, orgId));
  const sections = Object.fromEntries(SECTION_IDS.map((id) => [id, {}])) as Record<SectionId, SectionData>;
  let updatedAt: Date | null = null;
  for (const row of rows) {
    if (row.section in sections) sections[row.section as SectionId] = row.data;
    if (!updatedAt || row.updatedAt > updatedAt) updatedAt = row.updatedAt;
  }
  return { schemaVersion: PROFILE_SCHEMA_VERSION, sections, updatedAt: updatedAt?.toISOString() ?? null };
}

/**
 * Writes one field. The row is locked for the read-modify-write, so two saves
 * to different fields of a section cannot overwrite each other.
 */
export async function writeField(
  db: Db | Tx,
  orgId: string,
  def: FieldDef,
  value: Exclude<FieldValue, CollectionItem[]> | CollectionItemInput[] | null,
  source: Source,
): Promise<SectionData> {
  return db.transaction(async (tx) => {
    const where = and(eq(profileSections.orgId, orgId), eq(profileSections.section, def.section));
    const [row] = await tx.select().from(profileSections).where(where).for("update");
    if (!row) throw new Error(`Profile section ${def.section} is missing for organisation ${orgId}`);

    const data = applyFieldValue(row.data, def, value, source, randomUUID);
    await tx
      .update(profileSections)
      .set({ data, schemaVersion: PROFILE_SCHEMA_VERSION, updatedAt: new Date() })
      .where(where);
    return data;
  });
}
