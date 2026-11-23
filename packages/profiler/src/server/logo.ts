import { and, eq } from "drizzle-orm";
import sharp from "sharp";
import { companyAssets, withCompany, type Db } from "@magnisale/db";
import { getField } from "../fields.js";
import type { ImageValue } from "../values.js";
import { ownerSource, writeFieldInTx } from "./store.js";

export const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const LOGO_MAX_PIXELS = 40_000_000;
const LOGO_FORMATS = new Set(["png", "jpeg", "webp"]);

/**
 * Re-encoding keeps only pixels, so nothing else in an upload is ever served
 * back. SVG is refused because it can carry scripts. Null means not an image
 * we accept.
 */
export async function normaliseLogo(input: Buffer): Promise<Buffer | null> {
  try {
    const meta = await sharp(input, { limitInputPixels: LOGO_MAX_PIXELS }).metadata();
    if (!meta.format || !LOGO_FORMATS.has(meta.format)) return null;
    return await sharp(input, { limitInputPixels: LOGO_MAX_PIXELS })
      .rotate()
      .resize(512, 512, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

export async function saveLogo(db: Db, companyId: string, png: Buffer): Promise<void> {
  const updatedAt = new Date();
  await withCompany(db, companyId, async (tx) => {
    await tx
      .insert(companyAssets)
      .values({ companyId, kind: "logo", mime: "image/png", bytes: png, updatedAt })
      .onConflictDoUpdate({
        target: [companyAssets.companyId, companyAssets.kind],
        set: { mime: "image/png", bytes: png, updatedAt },
      });
    const value: ImageValue = { asset: "logo", updatedAt: updatedAt.toISOString() };
    await writeFieldInTx(tx, companyId, getField("identity.logo")!, value, ownerSource());
  });
}

export async function readLogo(db: Db, companyId: string) {
  const [asset] = await withCompany(db, companyId, (tx) =>
    tx
      .select()
      .from(companyAssets)
      .where(and(eq(companyAssets.companyId, companyId), eq(companyAssets.kind, "logo")))
      .limit(1),
  );
  return asset ?? null;
}

export async function removeLogo(db: Db, companyId: string): Promise<void> {
  await withCompany(db, companyId, async (tx) => {
    await tx.delete(companyAssets).where(and(eq(companyAssets.companyId, companyId), eq(companyAssets.kind, "logo")));
    await writeFieldInTx(tx, companyId, getField("identity.logo")!, null, ownerSource());
  });
}
