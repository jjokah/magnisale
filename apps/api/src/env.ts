import { z } from "zod";

const DEV_DATABASE_URL = "postgres://magnisale:magnisale@localhost:5433/magnisale";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  LOG_LEVEL: z.string().default("info"),

  DATABASE_URL: z.string().optional(),
  APP_URL: z.string().url().default("http://localhost:5173"),
  SESSION_DAYS: z.coerce.number().int().positive().default(30),

  // Which peers may set X-Forwarded-For: comma-separated addresses, CIDRs or the
  // presets loopback, linklocal and uniquelocal. Empty trusts nobody. Rate
  // limiting keys off the resulting address, so this must name the real proxy.
  // Not a hop count: Fastify treats a number as "trust nobody", which would put
  // every visitor behind a proxy in one rate-limit bucket.
  TRUST_PROXY: z.string().default("loopback"),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_AUTH_WINDOW: z.string().default("15 minutes"),

  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),

  SMTP_URL: z.string().default(""),
  MAIL_FROM: z.string().default("Magnisale <hello@magnisale.com>"),

  /** The built web app, served by the API in production. */
  STATIC_DIR: z.string().default(""),
});

export type Env = Omit<z.infer<typeof envSchema>, "DATABASE_URL"> & { DATABASE_URL: string };

export function loadEnv(overrides: Partial<Record<string, string>> = {}): Env {
  const parsed = envSchema.safeParse({ ...process.env, ...overrides });
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  const env = parsed.data;
  if (env.NODE_ENV === "production") {
    if (!env.DATABASE_URL) throw new Error("DATABASE_URL must be set in production.");
    if (!env.APP_URL.startsWith("https://")) {
      throw new Error("APP_URL must be an https:// address in production, because session cookies are Secure.");
    }
  }
  return { ...env, DATABASE_URL: env.DATABASE_URL ?? DEV_DATABASE_URL };
}
