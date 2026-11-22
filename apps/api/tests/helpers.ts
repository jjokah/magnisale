import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import type { GoogleAuth, GoogleIdentity } from "../src/auth/google.js";
import { loadEnv } from "../src/env.js";
import type { Mail } from "../src/services/mailer.js";

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://magnisale:magnisale@localhost:5433/magnisale_test";

export interface TestApp {
  app: FastifyInstance;
  mail: Mail[];
  googleIdentity: { current: GoogleIdentity };
}

export async function createTestApp(overrides: Record<string, string> = {}): Promise<TestApp> {
  const mail: Mail[] = [];
  const googleIdentity = {
    current: { sub: "google-1", email: "owner@example.com", emailVerified: true, name: "Ada Owner" },
  };
  const google: GoogleAuth = {
    authorizationUrl: (state) => new URL(`https://accounts.example/auth?state=${state}`),
    exchange: async () => googleIdentity.current,
  };
  const env = loadEnv({
    NODE_ENV: "test",
    DATABASE_URL: TEST_DATABASE_URL,
    RATE_LIMIT_AUTH_MAX: "10000",
    STATIC_DIR: "",
    ...overrides,
  });
  const app = await buildApp({
    env,
    logger: false,
    google,
    mailer: {
      send: async (m) => {
        mail.push(m);
      },
    },
  });
  await app.ready();
  return { app, mail, googleIdentity };
}

export async function resetDb(app: FastifyInstance): Promise<void> {
  await app.ctx.pool.query("truncate users, organizations cascade");
}

const CSRF = { "x-magnisale-csrf": "1" };

/** A tiny client that keeps cookies, like a browser. */
export class Browser {
  private cookies = new Map<string, string>();

  constructor(private app: FastifyInstance) {}

  private cookieHeader(): Record<string, string> {
    if (this.cookies.size === 0) return {};
    return { cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ") };
  }

  async request(method: "GET" | "POST" | "PATCH" | "DELETE", url: string, payload?: unknown) {
    const response = await this.app.inject({
      method,
      url: `/api/v1${url}`,
      headers: { ...(method === "GET" ? {} : CSRF), ...this.cookieHeader() },
      ...(payload === undefined ? {} : { payload: payload as object }),
    });
    for (const cookie of response.cookies) {
      if (cookie.value === "" || cookie.maxAge === 0) this.cookies.delete(cookie.name);
      else this.cookies.set(cookie.name, cookie.value);
    }
    return response;
  }

  get = (url: string) => this.request("GET", url);
  post = (url: string, payload?: unknown) => this.request("POST", url, payload);
  patch = (url: string, payload?: unknown) => this.request("PATCH", url, payload);
  delete = (url: string, payload?: unknown) => this.request("DELETE", url, payload);

  async upload(url: string, filename: string, mime: string, bytes: Buffer) {
    const boundary = "----magnisale-test";
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`),
      bytes,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    return this.app.inject({
      method: "POST",
      url: `/api/v1${url}`,
      headers: { ...CSRF, ...this.cookieHeader(), "content-type": `multipart/form-data; boundary=${boundary}` },
      payload: body,
    });
  }
}

export const signUpBody = (email = "owner@example.com", companyName = "Acme Foods") => ({
  name: "Ada Owner",
  email,
  password: "correct horse battery",
  companyName,
  consent: true,
});

export async function signedUp(app: FastifyInstance, email?: string, companyName?: string): Promise<Browser> {
  const browser = new Browser(app);
  const response = await browser.post("/auth/sign-up", signUpBody(email, companyName));
  if (response.statusCode !== 201) throw new Error(`Sign-up failed: ${response.body}`);
  return browser;
}
