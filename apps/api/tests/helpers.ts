import pg from "pg";
import { vi } from "vitest";
import { TEST_DATABASE_URL, TEST_OWNER_DATABASE_URL, truncateAll } from "@magnisale/db/testing";
import type { Mail } from "@magnisale/integrations";
import { createApp } from "../src/app.js";
import { createDeps, type AppDeps } from "../src/context.js";
import { loadEnv } from "../src/env.js";

export const ORIGIN = "http://localhost:5173";

export interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
}

export interface TestApp {
  app: ReturnType<typeof createApp>;
  deps: AppDeps;
  owner: pg.Pool;
  mail: Mail[];
  google: { profile: GoogleProfile };
  close(): Promise<void>;
}

const defaultGoogle = (): GoogleProfile => ({
  sub: "google-1",
  email: "owner@example.com",
  email_verified: true,
  name: "Ada Owner",
});

const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

export async function createTestApp(overrides: Record<string, string> = {}): Promise<TestApp> {
  const mail: Mail[] = [];
  const google = { profile: defaultGoogle() };
  const env = loadEnv({
    NODE_ENV: "test",
    DATABASE_URL: TEST_DATABASE_URL,
    APP_URL: ORIGIN,
    BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-1234",
    RATE_LIMIT_AUTH_MAX: "10000",
    TRUST_PROXY: "loopback",
    ...overrides,
  });
  const deps = createDeps(env, {
    google: { clientId: "test-client", clientSecret: "test-secret" },
    mailer: {
      send: async (m) => {
        mail.push(m);
      },
    },
    log: { info: () => undefined, warn: () => undefined, error: () => undefined },
  });
  const owner = new pg.Pool({ connectionString: TEST_OWNER_DATABASE_URL });

  // Google's token endpoint, answered locally so tests never leave the machine.
  const realFetch = globalThis.fetch;
  vi.stubGlobal("fetch", async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.startsWith("https://oauth2.googleapis.com/token")) {
      const idToken = `${base64url({ alg: "none" })}.${base64url({ ...google.profile, picture: null })}.sig`;
      return new Response(
        JSON.stringify({ access_token: "a", id_token: idToken, token_type: "Bearer", expires_in: 3600 }),
        { headers: { "content-type": "application/json" } },
      );
    }
    return realFetch(input, init);
  });

  return {
    app: createApp(deps),
    deps,
    owner,
    mail,
    google,
    close: async () => {
      vi.unstubAllGlobals();
      await Promise.all([deps.pool.end(), owner.end()]);
    },
  };
}

export async function resetDb(t: TestApp): Promise<void> {
  await truncateAll(t.owner);
  t.mail.length = 0;
  t.google.profile = defaultGoogle();
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

/** Tests read whatever shape a route returned. */
export type TestResponse = Omit<Response, "json"> & { json(): Promise<any> };

/** A tiny client that keeps cookies and sends the headers a browser would. */
export class Browser {
  private cookies = new Map<string, string>();

  constructor(private t: TestApp) {}

  private store(response: Response) {
    for (const line of response.headers.getSetCookie()) {
      const [pair, ...attributes] = line.split(";");
      const index = pair!.indexOf("=");
      const name = pair!.slice(0, index).trim();
      const value = pair!.slice(index + 1).trim();
      const expired = attributes.some((a) => /^\s*max-age=0\s*$/i.test(a));
      if (value === "" || expired) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }

  private headers(method: Method): Record<string, string> {
    return {
      ...(method === "GET" ? {} : { "x-magnisale-csrf": "1", origin: ORIGIN }),
      ...(this.cookies.size > 0 ? { cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ") } : {}),
    };
  }

  async raw(method: Method, path: string, payload?: unknown): Promise<TestResponse> {
    const response = await this.t.app.request(path, {
      method,
      redirect: "manual",
      headers: {
        ...this.headers(method),
        ...(payload === undefined ? {} : { "content-type": "application/json" }),
      },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
    });
    this.store(response);
    return response;
  }

  get = (path: string) => this.raw("GET", `/api/v1${path}`);
  post = (path: string, payload?: unknown) => this.raw("POST", `/api/v1${path}`, payload);
  patch = (path: string, payload?: unknown) => this.raw("PATCH", `/api/v1${path}`, payload);
  delete = (path: string, payload?: unknown) => this.raw("DELETE", `/api/v1${path}`, payload);
  auth = (path: string, payload?: unknown) => this.raw("POST", `/api/auth${path}`, payload);

  async upload(path: string, filename: string, mime: string, bytes: Buffer): Promise<TestResponse> {
    const form = new FormData();
    form.append("file", new File([new Uint8Array(bytes)], filename, { type: mime }));
    const response = await this.t.app.request(`/api/v1${path}`, {
      method: "POST",
      headers: this.headers("POST"),
      body: form,
    });
    this.store(response);
    return response;
  }

  /** The whole Google round trip, with the token exchange answered locally. */
  async signInWithGoogle(state?: string) {
    const start = await this.auth("/sign-in/social", {
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/sign-in",
    });
    const { url } = (await start.json()) as { url: string };
    const realState = new URL(url).searchParams.get("state")!;
    return this.raw("GET", `/api/auth/callback/google?code=abc&state=${state ?? realState}`);
  }
}

export const signUpBody = (email = "owner@example.com", companyName = "Acme Foods") => ({
  name: "Ada Owner",
  email,
  password: "correct horse battery",
  companyName,
  consent: true,
});

export async function signedUp(t: TestApp, email?: string, companyName?: string): Promise<Browser> {
  const browser = new Browser(t);
  const response = await browser.auth("/sign-up/email", signUpBody(email, companyName));
  if (response.status !== 200) throw new Error(`Sign-up failed: ${await response.text()}`);
  return browser;
}
