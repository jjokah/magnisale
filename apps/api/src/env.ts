import { z } from "zod";

const DEV_DATABASE_URL = "postgres://magnisale_app:magnisale_app@localhost:5433/magnisale";
const DEV_AUTH_SECRET = "development-only-secret-not-for-production";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),

  /** Connects as the app role, which row-level security applies to. */
  DATABASE_URL: z.string().optional(),
  APP_URL: z.string().url().default("http://localhost:5173"),
  BETTER_AUTH_SECRET: z.string().optional(),

  // Which peers may set X-Forwarded-For: comma-separated addresses, CIDRs or the
  // presets loopback, linklocal and uniquelocal. Empty trusts nobody. Rate
  // limiting keys off the resulting address, so this must name the real proxy.
  TRUST_PROXY: z.string().default("loopback"),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_AUTH_WINDOW_SECONDS: z.coerce.number().int().positive().default(15 * 60),

  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),

  SMTP_URL: z.string().default(""),
  MAIL_FROM: z.string().default("Magnisale <hello@magnisale.com>"),
});

export type Env = Omit<z.infer<typeof envSchema>, "DATABASE_URL" | "BETTER_AUTH_SECRET"> & {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
};

export function loadEnv(overrides: Partial<Record<string, string>> = {}): Env {
  const parsed = envSchema.safeParse({ ...process.env, ...overrides });
  if (!parsed.success) throw new Error(`Invalid environment configuration: ${parsed.error.message}`);

  const env = parsed.data;
  if (env.NODE_ENV === "production") {
    if (!env.DATABASE_URL) throw new Error("DATABASE_URL must be set in production.");
    if (!env.APP_URL.startsWith("https://")) {
      throw new Error("APP_URL must be an https:// address in production, because session cookies are Secure.");
    }
    if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
      throw new Error("BETTER_AUTH_SECRET must be a random value of at least 32 characters. Generate one with: openssl rand -hex 32");
    }
  }
  return {
    ...env,
    DATABASE_URL: env.DATABASE_URL ?? DEV_DATABASE_URL,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET ?? DEV_AUTH_SECRET,
  };
}
