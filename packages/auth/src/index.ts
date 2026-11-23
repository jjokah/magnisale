import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { organization } from "better-auth/plugins";
import { z } from "zod";
import { companies, memberships, schema, setCompany, type Db, type Tx } from "@magnisale/db";

/** Bump when the privacy notice changes materially. Stored with each consent. */
export const PRIVACY_VERSION = "2026-11-draft";

/**
 * The client address the API worked out from its trusted proxy. The API strips
 * any copy a client sends, so rate limits cannot be dodged by forging it.
 */
export const CLIENT_IP_HEADER = "x-magnisale-client-ip";

const RESET_TTL_SECONDS = 60 * 60;
const SESSION_DAYS = 30;

const signUpExtras = z.object({
  companyName: z.string().trim().min(1, "Enter your company name.").max(200, "Keep the name under 200 characters."),
  consent: z.literal(true, "Please agree to the privacy notice to continue."),
});

export interface AuthDeps {
  db: Db;
  baseUrl: string;
  secret: string;
  secureCookies: boolean;
  google: { clientId: string; clientSecret: string } | null;
  rateLimit: { max: number; windowSeconds: number };
  sendEmail(mail: { to: string; subject: string; text: string }): Promise<void>;
  /** Lays out what a new company starts with. Runs in the creating transaction. */
  seedCompany(tx: Tx, companyId: string, name: string): Promise<void>;
  onError(message: string, error: unknown): void;
}

function slugFor(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "company"}-${randomBytes(4).toString("hex")}`;
}

/** Creates a company with this user as its owner. The unique index allows only one. */
export async function createCompanyForUser(
  deps: Pick<AuthDeps, "db" | "seedCompany">,
  userId: string,
  name: string,
): Promise<string> {
  return deps.db.transaction(async (tx) => {
    const [company] = await tx.insert(companies).values({ name, slug: slugFor(name) }).returning({ id: companies.id });
    const companyId = company!.id;
    await tx.insert(memberships).values({ organizationId: companyId, userId, role: "owner" });
    await setCompany(tx, companyId);
    await deps.seedCompany(tx, companyId, name);
    return companyId;
  });
}

export function createAuth(deps: AuthDeps) {
  const { db, rateLimit } = deps;
  const credentialLimit = { window: rateLimit.windowSeconds, max: rateLimit.max };

  return betterAuth({
    baseURL: deps.baseUrl,
    basePath: "/api/auth",
    secret: deps.secret,
    trustedOrigins: [deps.baseUrl],
    database: drizzleAdapter(db, { provider: "pg", schema, transaction: true }),

    user: {
      modelName: "users",
      additionalFields: {
        // input: false means no client request can ever set these.
        consentAt: { type: "date", required: false, input: false },
        consentVersion: { type: "string", required: false, input: false },
        isStaff: { type: "boolean", required: false, input: false, defaultValue: false },
      },
    },
    session: { modelName: "sessions", expiresIn: SESSION_DAYS * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
    account: {
      modelName: "accounts",
      // Sign-up does not prove email ownership, so someone could register a
      // victim's address and wait. A Google sign-in never joins an existing
      // account by email alone.
      accountLinking: { enabled: true, disableImplicitLinking: true },
    },
    verification: { modelName: "verifications" },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      autoSignIn: true,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: RESET_TTL_SECONDS,
      sendResetPassword: async ({ user, token }) => {
        const link = new URL("/reset-password", deps.baseUrl);
        link.searchParams.set("token", token);
        // Not awaited: a slow mail server must not reveal that the account exists.
        void deps
          .sendEmail({
            to: user.email,
            subject: "Reset your Magnisale password",
            text: `Hello ${user.name},\n\nUse this link to choose a new password. It works once, for one hour:\n\n${link}\n\nIf you did not ask for this, you can ignore this email.\n\nMagnisale`,
          })
          .catch((error: unknown) => deps.onError("Could not send the reset email", error));
      },
    },

    socialProviders: deps.google ? { google: deps.google } : {},

    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "rateLimits",
      window: 60,
      max: 300,
      customRules: {
        "/sign-in/email": credentialLimit,
        "/sign-up/email": credentialLimit,
        "/request-password-reset": credentialLimit,
        "/reset-password": credentialLimit,
      },
    },

    telemetry: { enabled: false },

    advanced: {
      // Better Auth switches this check off when NODE_ENV is "test". Set
      // explicitly, so a mistaken NODE_ENV can never remove the protection.
      disableOriginCheck: false,
      cookiePrefix: "magnisale",
      useSecureCookies: deps.secureCookies,
      database: { generateId: "uuid" },
      ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] },
    },

    databaseHooks: {
      user: {
        create: {
          // Google sign-ups give consent on the welcome step instead.
          before: async (user, ctx) => {
            if (ctx?.path !== "/sign-up/email") return { data: user };
            return { data: { ...user, consentAt: new Date(), consentVersion: PRIVACY_VERSION } };
          },
        },
      },
    },

    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") return;
        const extras = signUpExtras.safeParse(ctx.body);
        if (!extras.success) {
          throw new APIError("UNPROCESSABLE_ENTITY", { message: extras.error.issues[0]?.message ?? "That is not valid." });
        }
      }),
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") return;
        const created = ctx.context.newSession;
        if (!created) return;
        const { companyName } = signUpExtras.parse(ctx.body);
        try {
          await createCompanyForUser(deps, created.user.id, companyName);
        } catch (error) {
          // The account exists, so the welcome step can finish the set-up.
          deps.onError("Could not create the company at sign-up", error);
        }
      }),
    },

    plugins: [
      organization({
        // Companies are created by the sign-up and welcome flows, after consent.
        allowUserToCreateOrganization: false,
        organizationLimit: 1,
        schema: {
          organization: { modelName: "companies" },
          member: { modelName: "memberships" },
          invitation: { modelName: "invitations" },
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
