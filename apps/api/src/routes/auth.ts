import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { CLIENT_IP_HEADER, createCompanyForUser, PRIVACY_VERSION } from "@magnisale/auth";
import { companies, users } from "@magnisale/db";
import { onboardingSchema } from "@magnisale/validation";
import type { AppEnv } from "../context.js";
import { clientAddress, limitBody } from "../middleware/security.js";
import { requireUser } from "../middleware/session.js";
import { validate } from "../middleware/validate.js";

/** Better Auth's own endpoints, under /api/auth. */
export const authHandler = new Hono<AppEnv>()
  // Companies are created by the sign-up and welcome flows, after consent. The
  // plugin's endpoints for managing them stay closed until teams ship.
  .all("/organization/*", (c) => c.json({ detail: "Not found." }, 404))
  .on(["GET", "POST"], "/*", limitBody(64 * 1024), (c) => {
    const headers = new Headers(c.req.raw.headers);
    headers.set(CLIENT_IP_HEADER, clientAddress(c));
    return c.var.deps.auth.handler(new Request(c.req.raw, { headers }));
  });

/** The signed-in person, under /api/v1/account. */
export const accountRoutes = new Hono<AppEnv>()
  .get("/me", requireUser, async (c) => {
    const { user, companyId } = c.var.session;
    const [company] = companyId
      ? await c.var.deps.db.select().from(companies).where(eq(companies.id, companyId)).limit(1)
      : [];
    return c.json({
      user,
      company: company ? { id: company.id, name: company.name } : null,
      needsOnboarding: !company,
    });
  })

  // Google sign-ups arrive with no company and no consent yet.
  .post("/onboarding", requireUser, validate("json", onboardingSchema), async (c) => {
    const { user, companyId } = c.var.session;
    if (companyId) return c.json({ detail: "Your organisation is already set up." }, 409);

    const { companyName } = c.req.valid("json");
    const deps = c.var.deps;
    await deps.db
      .update(users)
      .set({ consentAt: new Date(), consentVersion: PRIVACY_VERSION })
      .where(eq(users.id, user.id));
    await createCompanyForUser(deps, user.id, companyName);
    return c.json({ ok: true as const });
  });
