import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Db } from "../db/client.js";
import { memberships, sessions, users } from "../db/schema.js";
import type { Env } from "../env.js";

export const SESSION_COOKIE = "mg_session";

// Touching the row on every request would turn each read into a write.
const REFRESH_AFTER_MS = 60 * 60 * 1000;

export interface AuthContext {
  user: typeof users.$inferSelect;
  orgId: string | null;
  tokenHash: string;
}

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions(env: Env, maxAgeSeconds: number) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
  };
}

function sessionExpiry(env: Env): Date {
  return new Date(Date.now() + env.SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function startSession(db: Db, env: Env, reply: FastifyReply, userId: string): Promise<void> {
  const token = newToken();
  await db.insert(sessions).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt: sessionExpiry(env),
  });
  reply.setCookie(SESSION_COOKIE, token, cookieOptions(env, env.SESSION_DAYS * 24 * 60 * 60));
}

export function clearSessionCookie(env: Env, reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE, { ...cookieOptions(env, 0), maxAge: undefined });
}

export async function loadAuth(request: FastifyRequest): Promise<AuthContext | null> {
  const { db, env } = request.server.ctx;
  const token = request.cookies[SESSION_COOKIE];
  if (!token) return null;

  const tokenHash = hashToken(token);
  const now = new Date();
  const [row] = await db
    .select({ user: users, orgId: memberships.orgId, lastSeenAt: sessions.lastSeenAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(memberships, eq(memberships.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);
  if (!row) return null;

  if (now.getTime() - row.lastSeenAt.getTime() > REFRESH_AFTER_MS) {
    await db
      .update(sessions)
      .set({ lastSeenAt: now, expiresAt: sessionExpiry(env) })
      .where(eq(sessions.tokenHash, tokenHash));
  }
  return { user: row.user, orgId: row.orgId, tokenHash };
}

export async function requireUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const auth = await loadAuth(request);
  if (!auth) {
    await reply.code(401).send({ detail: "Please sign in." });
    return;
  }
  request.auth = auth;
}

/** For everything that touches a profile. Sets `request.auth.orgId`. */
export async function requireOrg(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireUser(request, reply);
  if (reply.sent) return;
  if (!request.auth?.orgId) {
    await reply.code(403).send({ detail: "Finish setting up your organisation first." });
  }
}

/** The caller's organisation. Only valid behind `requireOrg`. */
export function orgIdOf(request: FastifyRequest): string {
  const orgId = request.auth?.orgId;
  if (!orgId) throw new Error("orgIdOf used on a route without requireOrg");
  return orgId;
}
