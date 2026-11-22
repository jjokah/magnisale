import { generateCodeVerifier, generateState } from "arctic";
import { and, eq, gt } from "drizzle-orm";
import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { dummyPasswordHash, hashPassword, normalizeEmail, verifyPassword } from "../auth/password.js";
import {
  clearSessionCookie,
  hashToken,
  newToken,
  requireUser,
  SESSION_COOKIE,
  startSession,
} from "../auth/session.js";
import { organizations, passwordResets, sessions, users } from "../db/schema.js";
import { createOrganization } from "../profile/store.js";

/** Bump when the privacy notice changes materially. Stored with each consent. */
export const PRIVACY_VERSION = "2026-11-draft";

const RESET_TTL_MS = 60 * 60 * 1000;
const OAUTH_COOKIE_PATH = "/api/v1/auth/google";
const OAUTH_STATE = "mg_oauth_state";
const OAUTH_VERIFIER = "mg_oauth_verifier";

const password = z
  .string()
  .min(10, "Use at least 10 characters for your password.")
  // bcrypt reads only the first 72 bytes, so a longer one would be silently cut.
  .refine((p) => Buffer.byteLength(p) <= 72, "Keep your password under 72 characters.");
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));
const companyName = z.string().trim().min(1, "Enter your company name.").max(200);
const consent = z.literal(true, "Please agree to the privacy notice to continue.");

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  email,
  password,
  companyName,
  consent,
});
const signInSchema = z.object({ email: z.string().min(1), password: z.string().min(1) });
const forgotSchema = z.object({ email });
const resetSchema = z.object({ token: z.string().min(1), password });
const onboardingSchema = z.object({ companyName, consent });

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const { db, env, mailer, google } = app.ctx;
  const authLimit = {
    config: { rateLimit: { max: env.RATE_LIMIT_AUTH_MAX, timeWindow: env.RATE_LIMIT_AUTH_WINDOW } },
  };

  // Computed now so the first failed sign-in does not pay for it.
  void dummyPasswordHash();

  app.post("/auth/sign-up", authLimit, async (request, reply) => {
    const body = signUpSchema.parse(request.body);
    const passwordHash = await hashPassword(body.password);

    const userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: body.email,
          name: body.name,
          passwordHash,
          consentAt: new Date(),
          consentVersion: PRIVACY_VERSION,
        })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });
      if (!user) return null;
      await createOrganization(tx, user.id, body.companyName);
      return user.id;
    });
    if (!userId) {
      return reply.code(409).send({ detail: "An account with this email already exists. Try signing in." });
    }

    await startSession(db, env, reply, userId);
    return reply.code(201).send({ ok: true });
  });

  app.post("/auth/sign-in", authLimit, async (request, reply) => {
    const body = signInSchema.parse(request.body);
    const [user] = await db.select().from(users).where(eq(users.email, normalizeEmail(body.email))).limit(1);

    // Always run a full comparison, so a missing account, a Google-only
    // account and a wrong password all take the same time.
    const ok = await verifyPassword(body.password, user?.passwordHash ?? (await dummyPasswordHash()));
    if (!user?.passwordHash || !ok) {
      return reply.code(401).send({ detail: "That email and password do not match." });
    }

    await startSession(db, env, reply, user.id);
    return { ok: true };
  });

  app.post("/auth/sign-out", async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
    clearSessionCookie(env, reply);
    return { ok: true };
  });

  app.get("/auth/me", { preHandler: requireUser }, async (request) => {
    const { user, orgId } = request.auth!;
    const [org] = orgId
      ? await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1)
      : [];
    return {
      user: { id: user.id, email: user.email, name: user.name, isStaff: user.isStaff },
      organization: org ? { id: org.id, name: org.name } : null,
      needsOnboarding: !org,
    };
  });

  // Google sign-ups arrive with no organisation and no consent yet.
  app.post("/auth/complete-onboarding", { preHandler: requireUser }, async (request, reply) => {
    const body = onboardingSchema.parse(request.body);
    const { user, orgId } = request.auth!;
    if (orgId) return reply.code(409).send({ detail: "Your organisation is already set up." });

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ consentAt: new Date(), consentVersion: PRIVACY_VERSION })
        .where(eq(users.id, user.id));
      await createOrganization(tx, user.id, body.companyName);
    });
    return { ok: true };
  });

  // Answers the same whether or not the account exists.
  app.post("/auth/forgot-password", authLimit, async (request) => {
    const body = forgotSchema.parse(request.body);
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (user) {
      const token = newToken();
      await db.transaction(async (tx) => {
        await tx.delete(passwordResets).where(eq(passwordResets.userId, user.id));
        await tx.insert(passwordResets).values({
          tokenHash: hashToken(token),
          userId: user.id,
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        });
      });
      const link = new URL("/reset-password", env.APP_URL);
      link.searchParams.set("token", token);
      // Not awaited: a slow mail server must not reveal that the account exists.
      void mailer
        .send({
          to: user.email,
          subject: "Reset your Magnisale password",
          text: `Hello ${user.name},\n\nUse this link to choose a new password. It works once, for one hour:\n\n${link}\n\nIf you did not ask for this, you can ignore this email.\n\nMagnisale`,
        })
        .catch((error: unknown) => request.log.error({ err: error }, "Could not send the reset email"));
    }
    return { ok: true };
  });

  app.post("/auth/reset-password", authLimit, async (request, reply) => {
    const body = resetSchema.parse(request.body);
    const tokenHash = hashToken(body.token);
    const passwordHash = await hashPassword(body.password);

    const done = await db.transaction(async (tx) => {
      // Deleting first makes the link single-use, even under concurrent requests.
      const [reset] = await tx
        .delete(passwordResets)
        .where(and(eq(passwordResets.tokenHash, tokenHash), gt(passwordResets.expiresAt, new Date())))
        .returning({ userId: passwordResets.userId });
      if (!reset) return false;

      const now = new Date();
      await tx
        .update(users)
        .set({ passwordHash, passwordChangedAt: now, emailVerifiedAt: now })
        .where(eq(users.id, reset.userId));
      // A reset ends every session, which is the point of resetting a compromised account.
      await tx.delete(sessions).where(eq(sessions.userId, reset.userId));
      return true;
    });

    if (!done) {
      return reply.code(400).send({ detail: "This link has expired or was already used. Ask for a new one." });
    }
    clearSessionCookie(env, reply);
    return { ok: true };
  });

  const oauthCookie = {
    path: OAUTH_COOKIE_PATH,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    maxAge: 10 * 60,
  };

  function failGoogle(reply: FastifyReply) {
    return reply.redirect(new URL("/sign-in?error=google", env.APP_URL).toString());
  }

  app.get("/auth/google/start", async (_request, reply) => {
    if (!google) return reply.code(404).send({ detail: "Google sign-in is not set up." });
    const state = generateState();
    const verifier = generateCodeVerifier();
    reply.setCookie(OAUTH_STATE, state, oauthCookie);
    reply.setCookie(OAUTH_VERIFIER, verifier, oauthCookie);
    return reply.redirect(google.authorizationUrl(state, verifier).toString());
  });

  app.get("/auth/google/callback", async (request, reply) => {
    if (!google) return reply.code(404).send({ detail: "Google sign-in is not set up." });

    const { code, state } = request.query as { code?: string; state?: string };
    const expectedState = request.cookies[OAUTH_STATE];
    const verifier = request.cookies[OAUTH_VERIFIER];
    reply.clearCookie(OAUTH_STATE, { path: OAUTH_COOKIE_PATH });
    reply.clearCookie(OAUTH_VERIFIER, { path: OAUTH_COOKIE_PATH });
    if (!code || !state || !verifier || state !== expectedState) return failGoogle(reply);

    let identity;
    try {
      identity = await google.exchange(code, verifier);
    } catch (error) {
      request.log.warn({ err: error }, "Google sign-in failed");
      return failGoogle(reply);
    }
    if (!identity.emailVerified) return failGoogle(reply);

    const address = normalizeEmail(identity.email);
    const userId = await db.transaction(async (tx) => {
      const [bySub] = await tx.select().from(users).where(eq(users.googleSub, identity.sub)).limit(1);
      if (bySub) return bySub.id;

      const [byEmail] = await tx.select().from(users).where(eq(users.email, address)).for("update").limit(1);
      if (byEmail) {
        // Sign-up does not prove email ownership, so someone could register a
        // victim's address first and wait. If nobody has proved ownership
        // before now, the password and sessions created without proof go.
        const unproven = !byEmail.emailVerifiedAt;
        await tx
          .update(users)
          .set({
            googleSub: identity.sub,
            emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date(),
            ...(unproven ? { passwordHash: null } : {}),
          })
          .where(eq(users.id, byEmail.id));
        if (unproven) await tx.delete(sessions).where(eq(sessions.userId, byEmail.id));
        return byEmail.id;
      }

      const [created] = await tx
        .insert(users)
        .values({ email: address, name: identity.name, googleSub: identity.sub, emailVerifiedAt: new Date() })
        .returning({ id: users.id });
      return created!.id;
    });

    await startSession(db, env, reply, userId);
    return reply.redirect(new URL("/", env.APP_URL).toString());
  });
}
