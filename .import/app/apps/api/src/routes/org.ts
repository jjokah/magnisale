import { and, eq, inArray } from "drizzle-orm";
import { getField, type ImageValue } from "@magnisale/profile";
import type { FastifyInstance } from "fastify";
import sharp from "sharp";
import { z } from "zod";
import { clearSessionCookie, orgIdOf, requireOrg } from "../auth/session.js";
import { memberships, orgAssets, organizations, users } from "../db/schema.js";
import { ownerSource, readProfile, writeField } from "../profile/store.js";

const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const LOGO_MAX_PIXELS = 40_000_000;
const LOGO_FORMATS = new Set(["png", "jpeg", "webp"]);

const renameSchema = z.object({ name: z.string().trim().min(1, "Enter a name.").max(200) });
const deleteSchema = z.object({ confirmName: z.string() });

export async function orgRoutes(app: FastifyInstance): Promise<void> {
  const { db, env } = app.ctx;

  app.patch("/org", { preHandler: requireOrg }, async (request) => {
    const { name } = renameSchema.parse(request.body);
    await db.update(organizations).set({ name }).where(eq(organizations.id, orgIdOf(request)));
    return { ok: true };
  });

  // Everything held about the organisation, for the owner to take away.
  app.get("/org/export.json", { preHandler: requireOrg }, async (request, reply) => {
    const orgId = orgIdOf(request);
    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
    const members = await db
      .select({ name: users.name, email: users.email, role: memberships.role, consentAt: users.consentAt, consentVersion: users.consentVersion })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.orgId, orgId));
    const profile = await readProfile(db, orgId);

    return reply
      .header("Content-Disposition", 'attachment; filename="magnisale-profile.json"')
      .type("application/json")
      .send(
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            organization: { name: org!.name, createdAt: org!.createdAt, sharedWithMagnisaleAt: org!.sharedWithMagnisaleAt },
            members,
            profile,
          },
          null,
          2,
        ),
      );
  });

  // Requires the exact name, so it cannot happen by accident.
  app.delete("/org", { preHandler: requireOrg }, async (request, reply) => {
    const { confirmName } = deleteSchema.parse(request.body);
    const orgId = orgIdOf(request);
    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
    if (!org || confirmName.trim() !== org.name) {
      return reply.code(422).send({ detail: "Type your organisation's name exactly to confirm." });
    }

    await db.transaction(async (tx) => {
      // v1 accounts belong to one organisation, so the accounts go with it.
      // Sessions, resets, profile and assets follow by cascade.
      const members = await tx.select({ userId: memberships.userId }).from(memberships).where(eq(memberships.orgId, orgId));
      await tx.delete(organizations).where(eq(organizations.id, orgId));
      if (members.length > 0) {
        await tx.delete(users).where(inArray(users.id, members.map((m) => m.userId)));
      }
    });
    clearSessionCookie(env, reply);
    return { ok: true };
  });

  app.get("/org/logo", { preHandler: requireOrg }, async (request, reply) => {
    const [asset] = await db
      .select()
      .from(orgAssets)
      .where(and(eq(orgAssets.orgId, orgIdOf(request)), eq(orgAssets.kind, "logo")))
      .limit(1);
    if (!asset) return reply.code(404).send({ detail: "No logo yet." });
    return reply.header("Cache-Control", "private, no-cache").type(asset.mime).send(asset.bytes);
  });

  app.post("/org/logo", { preHandler: requireOrg }, async (request, reply) => {
    const orgId = orgIdOf(request);
    const file = await request.file({ limits: { fileSize: LOGO_MAX_BYTES, files: 1 } });
    if (!file) return reply.code(422).send({ detail: "Choose an image to upload." });
    const input = await file.toBuffer();

    // Re-encoding keeps only pixels, so nothing else in the upload is ever
    // served back. SVG is refused because it can carry scripts.
    let png: Buffer;
    try {
      const meta = await sharp(input, { limitInputPixels: LOGO_MAX_PIXELS }).metadata();
      if (!meta.format || !LOGO_FORMATS.has(meta.format)) throw new Error("Unsupported format");
      png = await sharp(input, { limitInputPixels: LOGO_MAX_PIXELS })
        .rotate()
        .resize(512, 512, { fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer();
    } catch {
      return reply.code(422).send({ detail: "Upload a PNG, JPEG or WebP image." });
    }

    const updatedAt = new Date();
    await db.transaction(async (tx) => {
      await tx
        .insert(orgAssets)
        .values({ orgId, kind: "logo", mime: "image/png", bytes: png, updatedAt })
        .onConflictDoUpdate({
          target: [orgAssets.orgId, orgAssets.kind],
          set: { mime: "image/png", bytes: png, updatedAt },
        });
      const value: ImageValue = { asset: "logo", updatedAt: updatedAt.toISOString() };
      await writeField(tx, orgId, getField("identity.logo")!, value, ownerSource());
    });
    return { ok: true };
  });

  app.delete("/org/logo", { preHandler: requireOrg }, async (request) => {
    const orgId = orgIdOf(request);
    await db.transaction(async (tx) => {
      await tx.delete(orgAssets).where(and(eq(orgAssets.orgId, orgId), eq(orgAssets.kind, "logo")));
      await writeField(tx, orgId, getField("identity.logo")!, null, ownerSource());
    });
    return { ok: true };
  });
}
