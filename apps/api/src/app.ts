import { existsSync } from "node:fs";
import { resolve } from "node:path";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import type pg from "pg";
import { ZodError } from "zod";
import { createGoogleAuth, type GoogleAuth } from "./auth/google.js";
import { createDb, runMigrations, type Db } from "./db/client.js";
import { loadEnv, type Env } from "./env.js";
import { authRoutes } from "./routes/auth.js";
import { orgRoutes } from "./routes/org.js";
import { profileRoutes } from "./routes/profile.js";
import { createMailer, type Mailer } from "./services/mailer.js";

export interface AppContext {
  db: Db;
  pool: pg.Pool;
  env: Env;
  mailer: Mailer;
  google: GoogleAuth | null;
}

declare module "fastify" {
  interface FastifyInstance {
    ctx: AppContext;
  }
}

export interface BuildOptions {
  env?: Env;
  /** Overrides so tests never send mail or reach Google. */
  mailer?: Mailer;
  google?: GoogleAuth | null;
  logger?: boolean;
}

export async function buildApp(options: BuildOptions = {}) {
  const env = options.env ?? loadEnv();
  const { db, pool } = createDb(env.DATABASE_URL);
  await runMigrations(db);

  const app: FastifyInstance = Fastify({
    logger: options.logger === false ? false : { level: env.LOG_LEVEL },
    trustProxy: env.TRUST_PROXY || false,
  });

  app.decorate("ctx", {
    db,
    pool,
    env,
    mailer: options.mailer ?? createMailer(env, { info: (m) => app.log.info(m), warn: (m) => app.log.warn(m) }),
    google: options.google === undefined ? createGoogleAuth(env) : options.google,
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // React sets a few inline style attributes.
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  });
  await app.register(cookie);
  await app.register(multipart);

  // Opt-in per route: only credential-guessing routes ask for a limit.
  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: (_request, context) =>
      Object.assign(new Error(`Too many attempts. Try again in ${context.after}.`), {
        statusCode: context.statusCode,
      }),
  });

  // Session cookies are SameSite=Lax. On top of that, every state-changing API
  // call must carry a custom header, which another site cannot add without a
  // CORS preflight, and this API allows no cross-origin requests.
  app.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith("/api/")) return;
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
    if (request.headers["x-magnisale-csrf"] !== "1") {
      await reply.code(403).send({ detail: "Request refused." });
    }
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(422).send({ detail: error.issues[0]?.message ?? "That is not valid." });
    }
    const status = error.statusCode ?? 500;
    if (status < 500) return reply.code(status).send({ detail: error.message });
    request.log.error({ err: error }, "Unhandled error");
    return reply.code(500).send({ detail: "Something went wrong on our side. Please try again." });
  });

  app.get("/api/v1/health", async () => {
    await pool.query("select 1");
    return { status: "ok" };
  });

  // Public: the sign-in screen needs this before anyone is signed in.
  app.get("/api/v1/meta", async () => ({ google: app.ctx.google !== null }));

  await app.register(authRoutes, { prefix: "/api/v1" });
  await app.register(orgRoutes, { prefix: "/api/v1" });
  await app.register(profileRoutes, { prefix: "/api/v1" });

  // In production the API also serves the built web app: one container, one port.
  const staticDir = env.STATIC_DIR;
  if (staticDir && existsSync(staticDir)) {
    await app.register(fastifyStatic, { root: resolve(staticDir) });
    // Client-side routes fall through to the app; a missing API path stays a JSON 404.
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api/")) return reply.code(404).send({ detail: "Not found." });
      return reply.sendFile("index.html");
    });
  } else {
    app.setNotFoundHandler((_request, reply) => reply.code(404).send({ detail: "Not found." }));
  }

  app.addHook("onClose", async () => {
    await pool.end();
  });

  return app;
}
