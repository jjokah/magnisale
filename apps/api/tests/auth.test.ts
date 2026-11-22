import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { sessions, users } from "../src/db/schema.js";
import { Browser, createTestApp, resetDb, signedUp, signUpBody, type TestApp } from "./helpers.js";

let t: TestApp;

beforeAll(async () => {
  t = await createTestApp();
});
afterAll(async () => {
  await t.app.close();
});
beforeEach(async () => {
  await resetDb(t.app);
  t.mail.length = 0;
});

function resetToken(): string {
  const match = t.mail.at(-1)?.text.match(/token=([\w-]+)/);
  if (!match?.[1]) throw new Error("No reset link in the last email");
  return match[1];
}

async function googleSignIn(browser: Browser) {
  const start = await browser.get("/auth/google/start");
  const state = new URL(start.headers.location as string).searchParams.get("state");
  return browser.get(`/auth/google/callback?code=abc&state=${state}`);
}

describe("sign-up and sign-in", () => {
  it("creates the account, organisation and a session", async () => {
    const browser = await signedUp(t.app);
    const me = (await browser.get("/auth/me")).json();
    expect(me.user.email).toBe("owner@example.com");
    expect(me.organization.name).toBe("Acme Foods");
    expect(me.needsOnboarding).toBe(false);

    const [row] = await t.app.ctx.db.select().from(users);
    expect(row?.consentAt).toBeInstanceOf(Date);
    expect(row?.passwordHash).not.toContain("correct");
  });

  it("requires consent", async () => {
    const response = await new Browser(t.app).post("/auth/sign-up", { ...signUpBody(), consent: false });
    expect(response.statusCode).toBe(422);
  });

  it("refuses a duplicate email, whatever its case", async () => {
    await signedUp(t.app);
    const response = await new Browser(t.app).post("/auth/sign-up", signUpBody("OWNER@example.com"));
    expect(response.statusCode).toBe(409);
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    await signedUp(t.app);
    const wrong = await new Browser(t.app).post("/auth/sign-in", { email: "owner@example.com", password: "nope nope nope" });
    const unknown = await new Browser(t.app).post("/auth/sign-in", { email: "nobody@example.com", password: "nope nope nope" });
    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(wrong.json()).toEqual(unknown.json());
  });

  it("stores only a hash of the session token", async () => {
    const browser = new Browser(t.app);
    const response = await browser.post("/auth/sign-up", signUpBody());
    const token = response.cookies.find((c) => c.name === "mg_session")!;
    expect(token.httpOnly).toBe(true);
    const [row] = await t.app.ctx.db.select().from(sessions);
    expect(row?.tokenHash).not.toBe(token.value);
  });

  it("ends the session on sign-out", async () => {
    const browser = await signedUp(t.app);
    await browser.post("/auth/sign-out");
    expect((await browser.get("/auth/me")).statusCode).toBe(401);
    expect(await t.app.ctx.db.select().from(sessions)).toHaveLength(0);
  });

  it("refuses state-changing requests without the CSRF header", async () => {
    const response = await t.app.inject({ method: "POST", url: "/api/v1/auth/sign-up", payload: signUpBody() });
    expect(response.statusCode).toBe(403);
  });
});

describe("password reset", () => {
  it("changes the password once and ends every session", async () => {
    const existing = await signedUp(t.app);
    await new Browser(t.app).post("/auth/forgot-password", { email: "owner@example.com" });
    const token = resetToken();

    const fresh = new Browser(t.app);
    expect((await fresh.post("/auth/reset-password", { token, password: "a brand new password" })).statusCode).toBe(200);
    expect((await existing.get("/auth/me")).statusCode).toBe(401);
    expect((await fresh.post("/auth/sign-in", { email: "owner@example.com", password: "a brand new password" })).statusCode).toBe(200);

    const again = await new Browser(t.app).post("/auth/reset-password", { token, password: "another new password" });
    expect(again.statusCode).toBe(400);
  });

  it("answers the same for an unknown email and sends nothing", async () => {
    const response = await new Browser(t.app).post("/auth/forgot-password", { email: "nobody@example.com" });
    expect(response.statusCode).toBe(200);
    expect(t.mail).toHaveLength(0);
  });

  it("invalidates an earlier link when a new one is requested", async () => {
    await signedUp(t.app);
    const browser = new Browser(t.app);
    await browser.post("/auth/forgot-password", { email: "owner@example.com" });
    const first = resetToken();
    await browser.post("/auth/forgot-password", { email: "owner@example.com" });
    expect((await browser.post("/auth/reset-password", { token: first, password: "a brand new password" })).statusCode).toBe(400);
  });
});

describe("Google sign-in", () => {
  it("refuses a callback whose state does not match", async () => {
    const browser = new Browser(t.app);
    await browser.get("/auth/google/start");
    const response = await browser.get("/auth/google/callback?code=abc&state=forged");
    expect(response.headers.location).toContain("error=google");
    expect((await browser.get("/auth/me")).statusCode).toBe(401);
  });

  it("refuses an unverified Google email", async () => {
    t.googleIdentity.current = { sub: "g2", email: "x@example.com", emailVerified: false, name: "X" };
    const browser = new Browser(t.app);
    const response = await googleSignIn(browser);
    expect(response.headers.location).toContain("error=google");
    t.googleIdentity.current = { sub: "google-1", email: "owner@example.com", emailVerified: true, name: "Ada Owner" };
  });

  it("sends a new Google user through onboarding, with consent", async () => {
    const browser = new Browser(t.app);
    await googleSignIn(browser);
    expect((await browser.get("/auth/me")).json().needsOnboarding).toBe(true);
    expect((await browser.get("/profile")).statusCode).toBe(403);

    expect((await browser.post("/auth/complete-onboarding", { companyName: "Acme", consent: false })).statusCode).toBe(422);
    expect((await browser.post("/auth/complete-onboarding", { companyName: "Acme", consent: true })).statusCode).toBe(200);
    expect((await browser.get("/auth/me")).json().organization.name).toBe("Acme");
  });

  it("removes a password set by someone who never proved they own the email", async () => {
    const attacker = await signedUp(t.app);

    const victim = new Browser(t.app);
    await googleSignIn(victim);
    expect((await victim.get("/auth/me")).statusCode).toBe(200);

    expect((await attacker.get("/auth/me")).statusCode).toBe(401);
    const retry = await new Browser(t.app).post("/auth/sign-in", {
      email: "owner@example.com",
      password: signUpBody().password,
    });
    expect(retry.statusCode).toBe(401);
  });

  it("keeps the password of an account whose email was already proved", async () => {
    await signedUp(t.app);
    await t.app.ctx.db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, "owner@example.com"));
    await googleSignIn(new Browser(t.app));
    const response = await new Browser(t.app).post("/auth/sign-in", {
      email: "owner@example.com",
      password: signUpBody().password,
    });
    expect(response.statusCode).toBe(200);
  });
});

describe("rate limiting", () => {
  it("limits sign-in attempts", async () => {
    const limited = await createTestApp({ RATE_LIMIT_AUTH_MAX: "2" });
    try {
      const browser = new Browser(limited.app);
      const attempt = () => browser.post("/auth/sign-in", { email: "a@example.com", password: "wrong wrong" });
      await attempt();
      await attempt();
      const third = await attempt();
      expect(third.statusCode).toBe(429);
      expect(third.json().detail).toContain("Too many attempts");
    } finally {
      await limited.app.close();
    }
  });

  const attempt = (app: TestApp["app"], remoteAddress: string, forwardedFor: string) =>
    app.inject({
      method: "POST",
      url: "/api/v1/auth/sign-in",
      remoteAddress,
      headers: { "x-magnisale-csrf": "1", "x-forwarded-for": forwardedFor },
      payload: { email: "a@example.com", password: "wrong wrong" },
    });

  it("counts visitors separately behind a trusted proxy", async () => {
    const limited = await createTestApp({ RATE_LIMIT_AUTH_MAX: "1", TRUST_PROXY: "loopback" });
    try {
      expect((await attempt(limited.app, "127.0.0.1", "198.51.100.1")).statusCode).toBe(401);
      expect((await attempt(limited.app, "127.0.0.1", "198.51.100.1")).statusCode).toBe(429);
      expect((await attempt(limited.app, "127.0.0.1", "198.51.100.2")).statusCode).toBe(401);
    } finally {
      await limited.app.close();
    }
  });

  it("ignores a forged X-Forwarded-For from anyone who is not the proxy", async () => {
    const limited = await createTestApp({ RATE_LIMIT_AUTH_MAX: "1", TRUST_PROXY: "loopback" });
    try {
      expect((await attempt(limited.app, "203.0.113.7", "198.51.100.1")).statusCode).toBe(401);
      expect((await attempt(limited.app, "203.0.113.7", "198.51.100.2")).statusCode).toBe(429);
    } finally {
      await limited.app.close();
    }
  });
});
