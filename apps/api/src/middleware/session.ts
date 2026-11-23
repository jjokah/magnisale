import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { memberships } from "@magnisale/db";
import type { AppEnv, SessionContext } from "../context.js";

async function loadSession(c: Context<AppEnv>): Promise<SessionContext | null> {
  const { auth, db } = c.var.deps;
  const result = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!result) return null;

  const { id, email, name, isStaff } = result.user;
  const [membership] = await db
    .select({ companyId: memberships.organizationId })
    .from(memberships)
    .where(eq(memberships.userId, id))
    .limit(1);
  return { user: { id, email, name, isStaff: isStaff === true }, companyId: membership?.companyId ?? null };
}

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const session = await loadSession(c);
  if (!session) return c.json({ detail: "Please sign in." }, 401);
  c.set("session", session);
  await next();
});

/** For everything that touches a company's data. */
export const requireCompany = createMiddleware<AppEnv>(async (c, next) => {
  const session = await loadSession(c);
  if (!session) return c.json({ detail: "Please sign in." }, 401);
  if (!session.companyId) return c.json({ detail: "Finish setting up your organisation first." }, 403);
  c.set("session", session);
  await next();
});

/** The caller's company. Only valid behind `requireCompany`. */
export function companyIdOf(c: Context<AppEnv>): string {
  const companyId = c.var.session?.companyId;
  if (!companyId) throw new Error("companyIdOf used on a route without requireCompany");
  return companyId;
}
