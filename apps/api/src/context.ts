import type { IncomingMessage } from "node:http";
import { createAuth, type Auth, type AuthDeps } from "@magnisale/auth";
import { createDb, type Db } from "@magnisale/db";
import { createMailer, type Mailer } from "@magnisale/integrations";
import { seedProfile } from "@magnisale/profiler/server";
import type { Env } from "./env.js";

export interface Log {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
}

export interface AppDeps {
  db: Db;
  pool: ReturnType<typeof createDb>["pool"];
  env: Env;
  auth: Auth;
  mailer: Mailer;
  log: Log;
  seedCompany: AuthDeps["seedCompany"];
}

export interface SessionContext {
  user: { id: string; email: string; name: string; isStaff: boolean };
  companyId: string | null;
}

export type AppEnv = {
  Bindings: { incoming?: IncomingMessage };
  Variables: { deps: AppDeps; session: SessionContext };
};

const consoleLog: Log = {
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
  error: (message, error) => console.error(message, error ?? ""),
};

export interface DepsOverrides {
  mailer?: Mailer;
  log?: Log;
  /** Lets tests sign in with Google without a real client. */
  google?: { clientId: string; clientSecret: string } | null;
}

export function createDeps(env: Env, overrides: DepsOverrides = {}): AppDeps {
  const log = overrides.log ?? consoleLog;
  const { db, pool } = createDb(env.DATABASE_URL);
  const mailer =
    overrides.mailer ??
    createMailer({ smtpUrl: env.SMTP_URL, from: env.MAIL_FROM, production: env.NODE_ENV === "production", log });
  const google =
    overrides.google !== undefined
      ? overrides.google
      : env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
        : null;

  const auth = createAuth({
    db,
    baseUrl: env.APP_URL,
    secret: env.BETTER_AUTH_SECRET,
    secureCookies: env.NODE_ENV === "production",
    google,
    rateLimit: { max: env.RATE_LIMIT_AUTH_MAX, windowSeconds: env.RATE_LIMIT_AUTH_WINDOW_SECONDS },
    sendEmail: (mail) => mailer.send(mail),
    seedCompany: seedProfile,
    onError: (message, error) => log.error(message, error),
  });

  return { db, pool, env, auth, mailer, log, seedCompany: seedProfile };
}
