import { eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { companies, memberships, users } from "@magnisale/db";
import { LOGO_MAX_BYTES, normaliseLogo, readLogo, readProfile, removeLogo, saveLogo } from "@magnisale/profiler/server";
import { deleteCompanySchema, logoUploadSchema, renameCompanySchema } from "@magnisale/validation";
import type { AppEnv } from "../context.js";
import { limitBody } from "../middleware/security.js";
import { companyIdOf, requireCompany } from "../middleware/session.js";
import { validate } from "../middleware/validate.js";

export const companyRoutes = new Hono<AppEnv>()
  .patch("/", requireCompany, validate("json", renameCompanySchema), async (c) => {
    const { name } = c.req.valid("json");
    await c.var.deps.db.update(companies).set({ name }).where(eq(companies.id, companyIdOf(c)));
    return c.json({ ok: true as const });
  })

  // Everything held about the company, for the owner to take away.
  .get("/export.json", requireCompany, async (c) => {
    const { db } = c.var.deps;
    const companyId = companyIdOf(c);
    const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    const members = await db
      .select({
        name: users.name,
        email: users.email,
        role: memberships.role,
        consentAt: users.consentAt,
        consentVersion: users.consentVersion,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.organizationId, companyId));
    const profile = await readProfile(db, companyId);

    c.header("Content-Disposition", 'attachment; filename="magnisale-profile.json"');
    return c.body(
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          company: {
            name: company!.name,
            createdAt: company!.createdAt,
            sharedWithMagnisaleAt: company!.sharedWithMagnisaleAt,
          },
          members,
          profile,
        },
        null,
        2,
      ),
      200,
      { "Content-Type": "application/json" },
    );
  })

  // Requires the exact name, so it cannot happen by accident.
  .delete("/", requireCompany, validate("json", deleteCompanySchema), async (c) => {
    const { db, auth, env } = c.var.deps;
    const { confirmName } = c.req.valid("json");
    const companyId = companyIdOf(c);
    const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    if (!company || confirmName.trim() !== company.name) {
      return c.json({ detail: "Type your organisation's name exactly to confirm." }, 422);
    }

    await db.transaction(async (tx) => {
      // v1 accounts belong to one company, so the accounts go with it. Sessions,
      // profile and assets follow by cascade.
      const members = await tx
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(eq(memberships.organizationId, companyId));
      await tx.delete(companies).where(eq(companies.id, companyId));
      if (members.length > 0) {
        await tx.delete(users).where(inArray(users.id, members.map((m) => m.userId)));
      }
    });

    const { authCookies } = await auth.$context;
    deleteCookie(c, authCookies.sessionToken.name, { path: "/", secure: env.NODE_ENV === "production" });
    return c.json({ ok: true as const });
  })

  .get("/logo", requireCompany, async (c) => {
    const asset = await readLogo(c.var.deps.db, companyIdOf(c));
    if (!asset) return c.json({ detail: "No logo yet." }, 404);
    return c.body(new Uint8Array(asset.bytes), 200, {
      "Content-Type": asset.mime,
      "Cache-Control": "private, no-cache",
    });
  })

  .post(
    "/logo",
    requireCompany,
    limitBody(LOGO_MAX_BYTES + 64 * 1024),
    validate("form", logoUploadSchema),
    async (c) => {
      const { file } = c.req.valid("form");
      if (file.size > LOGO_MAX_BYTES) return c.json({ detail: "That is too large to upload." }, 413);
      const png = await normaliseLogo(Buffer.from(await file.arrayBuffer()));
      if (!png) return c.json({ detail: "Upload a PNG, JPEG or WebP image." }, 422);
      await saveLogo(c.var.deps.db, companyIdOf(c), png);
      return c.json({ ok: true as const });
    },
  )

  .delete("/logo", requireCompany, async (c) => {
    await removeLogo(c.var.deps.db, companyIdOf(c));
    return c.json({ ok: true as const });
  });
