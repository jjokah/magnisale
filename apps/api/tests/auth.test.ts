import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { accounts, companies, memberships, sessions, users } from "@magnisale/db";
import { Browser, createTestApp, ORIGIN, resetDb, signedUp, signUpBody, type TestApp } from "./helpers.js";

let t: TestApp;

beforeAll(async () => {
  t = await createTestApp();
});
afterAll(async () => {
  await t.close();
});
beforeEach(async () => {
  await resetDb(t);
});

/** The reset email is sent without being awaited, so give it a moment. */
async function resetToken(): Promise<string> {
  for (let i = 0; i < 50 && t.mail.length === 0; i++) await new Promise((r) => setTimeout(r, 10));
  const match = t.mail.at(-1)?.text.match(/token=([\w-]+)/);
  if (!match?.[1]) throw new Error("No reset link in the last email");
  return match[1];
}

const requestReset = (browser: Browser, email = "owner@example.com") =>
  browser.auth("/request-password-reset", { email, redirectTo: "/reset-password" });

describe("sign-up and sign-in", () => {
  it("creates the account, company and a session", async () => {
    const browser = await signedUp(t);
    const me = await (await browser.get("/account/me")).json();
    expect(me.user.email).toBe("owner@example.com");
    expect(me.company.name).toBe("Acme Foods");
    expect(me.needsOnboarding).toBe(false);

    const [row] = await t.deps.db.select().from(users);
    expect(row?.consentAt).toBeInstanceOf(Date);
    const [account] = await t.deps.db.select().from(accounts);
    expect(account?.password).toBeTruthy();
    expect(account?.password).not.toContain("correct");
  });

  it("requires consent and a company name", async () => {
    const browser = new Browser(t);
    expect((await browser.auth("/sign-up/email", { ...signUpBody(), consent: false })).status).toBe(422);
    expect((await browser.auth("/sign-up/email", { ...signUpBody(), companyName: " " })).status).toBe(422);
    expect(await t.deps.db.select().from(users)).toHaveLength(0);
  });

  it("refuses a duplicate email, whatever its case", async () => {
    await signedUp(t);
    const response = await new Browser(t).auth("/sign-up/email", signUpBody("OWNER@example.com"));
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(await t.deps.db.select().from(users)).toHaveLength(1);
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    await signedUp(t);
    const wrong = await new Browser(t).auth("/sign-in/email", { email: "owner@example.com", password: "nope nope nope" });
    const unknown = await new Browser(t).auth("/sign-in/email", { email: "nobody@example.com", password: "nope nope nope" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
  });

  it("does not accept a session token from the database without its signature", async () => {
    const browser = await signedUp(t);
    expect((await browser.get("/account/me")).status).toBe(200);
    const [row] = await t.deps.db.select().from(sessions);
    const stolen = await t.app.request("/api/v1/account/me", {
      headers: { cookie: `magnisale.session_token=${row!.token}` },
    });
    expect(stolen.status).toBe(401);
  });

  it("marks the session cookie httpOnly", async () => {
    const response = await new Browser(t).auth("/sign-up/email", signUpBody());
    const cookie = response.headers.getSetCookie().find((c) => c.startsWith("magnisale.session_token="));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it("ends the session on sign-out", async () => {
    const browser = await signedUp(t);
    await browser.auth("/sign-out", {});
    expect((await browser.get("/account/me")).status).toBe(401);
    expect(await t.deps.db.select().from(sessions)).toHaveLength(0);
  });

  it("refuses state-changing API calls without the CSRF header", async () => {
    const browser = await signedUp(t);
    const cookie = (await browser.raw("GET", "/api/v1/health")).headers.get("set-cookie");
    expect(cookie).toBeNull();
    const response = await t.app.request("/api/v1/company", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
    expect(response.status).toBe(403);
  });

  it("refuses auth calls from another origin", async () => {
    const response = await t.app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example", cookie: "magnisale.session_token=x" },
      body: JSON.stringify({ email: "a@example.com", password: "whatever-long" }),
    });
    expect(response.status).toBe(403);
  });

  it("cannot make itself staff through any auth route", async () => {
    await new Browser(t).auth("/sign-up/email", { ...signUpBody("a@example.com"), isStaff: true, consentAt: "2000-01-01" });
    const browser = await signedUp(t, "b@example.com", "Beta");
    await browser.auth("/update-user", { isStaff: true });
    const rows = await t.deps.db.select().from(users);
    expect(rows.every((u) => u.isStaff === false)).toBe(true);
    expect(rows.every((u) => (u.consentAt?.getUTCFullYear() ?? 0) > 2000)).toBe(true);
  });

  it("keeps the company endpoints closed", async () => {
    const browser = await signedUp(t);
    for (const path of ["/organization/create", "/organization/delete", "/organization/invite-member"]) {
      expect((await browser.auth(path, { name: "x", slug: "x" })).status).toBe(404);
    }
    expect(await t.deps.db.select().from(companies)).toHaveLength(1);
  });
});

describe("password reset", () => {
  it("changes the password once and ends every session", async () => {
    const existing = await signedUp(t);
    await requestReset(new Browser(t));
    const token = await resetToken();

    const fresh = new Browser(t);
    expect((await fresh.auth("/reset-password", { token, newPassword: "a brand new password" })).status).toBe(200);
    expect((await existing.get("/account/me")).status).toBe(401);
    expect((await fresh.auth("/sign-in/email", { email: "owner@example.com", password: "a brand new password" })).status).toBe(200);

    const again = await new Browser(t).auth("/reset-password", { token, newPassword: "another new password" });
    expect(again.status).toBe(400);
  });

  it("answers the same for an unknown email and sends nothing", async () => {
    await signedUp(t);
    const known = await requestReset(new Browser(t));
    await resetToken();
    t.mail.length = 0;
    const unknown = await requestReset(new Browser(t), "nobody@example.com");
    expect(unknown.status).toBe(known.status);
    expect(await unknown.json()).toEqual(await known.json());
    await new Promise((r) => setTimeout(r, 50));
    expect(t.mail).toHaveLength(0);
  });

  it("links to the platform's reset page", async () => {
    await signedUp(t);
    await requestReset(new Browser(t));
    await resetToken();
    expect(t.mail.at(-1)?.text).toContain(`${ORIGIN}/reset-password?token=`);
  });
});

describe("Google sign-in", () => {
  it("refuses a callback whose state does not match", async () => {
    const browser = new Browser(t);
    const response = await browser.signInWithGoogle("forged");
    expect(response.status).toBe(302);
    expect((await browser.get("/account/me")).status).toBe(401);
    expect(await t.deps.db.select().from(users)).toHaveLength(0);
  });

  it("sends a new Google user through onboarding, with consent", async () => {
    const browser = new Browser(t);
    await browser.signInWithGoogle();
    const me = await (await browser.get("/account/me")).json();
    expect(me.needsOnboarding).toBe(true);
    expect((await browser.get("/profile")).status).toBe(403);
    const [before] = await t.deps.db.select().from(users);
    expect(before?.consentAt).toBeNull();

    expect((await browser.post("/account/onboarding", { companyName: "Acme", consent: false })).status).toBe(422);
    expect((await browser.post("/account/onboarding", { companyName: "Acme", consent: true })).status).toBe(200);
    expect((await (await browser.get("/account/me")).json()).company.name).toBe("Acme");
    const [after] = await t.deps.db.select().from(users);
    expect(after?.consentAt).toBeInstanceOf(Date);
  });

  it("allows only one company per account", async () => {
    const browser = await signedUp(t);
    expect((await browser.post("/account/onboarding", { companyName: "Second", consent: true })).status).toBe(409);
    expect(await t.deps.db.select().from(memberships)).toHaveLength(1);
  });

  it("never joins a Google sign-in to an unproven password account", async () => {
    const attacker = await signedUp(t);

    const victim = new Browser(t);
    const response = await victim.signInWithGoogle();
    expect(response.headers.get("location")).toContain("error=account_not_linked");
    expect((await victim.get("/account/me")).status).toBe(401);

    const linked = await t.deps.db.select().from(accounts).where(eq(accounts.providerId, "google"));
    expect(linked).toHaveLength(0);
    // The attacker's session gains nothing from the attempt either.
    expect((await (await attacker.get("/account/me")).json()).user.email).toBe("owner@example.com");
  });

  it("does not join even a proven account by email alone", async () => {
    await signedUp(t);
    await t.deps.db.update(users).set({ emailVerified: true }).where(eq(users.email, "owner@example.com"));
    const response = await new Browser(t).signInWithGoogle();
    expect(response.headers.get("location")).toContain("error=account_not_linked");
  });

  it("signs a returning Google user back in", async () => {
    const browser = new Browser(t);
    await browser.signInWithGoogle();
    await browser.post("/account/onboarding", { companyName: "Acme", consent: true });
    const again = new Browser(t);
    await again.signInWithGoogle();
    expect((await (await again.get("/account/me")).json()).company.name).toBe("Acme");
    expect(await t.deps.db.select().from(users)).toHaveLength(1);
  });
});

describe("rate limiting", () => {
  let limited: TestApp;

  beforeEach(async () => {
    limited = await createTestApp({ RATE_LIMIT_AUTH_MAX: "1", TRUST_PROXY: "loopback" });
    await resetDb(limited);
  });
  afterAll(async () => {
    await limited?.close();
  });

  const attempt = (remoteAddress: string, forwardedFor: string) =>
    limited.app.request(
      "/api/auth/sign-in/email",
      {
        method: "POST",
        headers: { "content-type": "application/json", origin: ORIGIN, "x-forwarded-for": forwardedFor },
        body: JSON.stringify({ email: "a@example.com", password: "wrong wrong wrong" }),
      },
      { incoming: { socket: { remoteAddress } } },
    );

  it("counts visitors separately behind a trusted proxy", async () => {
    expect((await attempt("127.0.0.1", "198.51.100.1")).status).toBe(401);
    expect((await attempt("127.0.0.1", "198.51.100.1")).status).toBe(429);
    expect((await attempt("127.0.0.1", "198.51.100.2")).status).toBe(401);
  });

  it("ignores a forged X-Forwarded-For from anyone who is not the proxy", async () => {
    expect((await attempt("203.0.113.7", "198.51.100.1")).status).toBe(401);
    expect((await attempt("203.0.113.7", "198.51.100.2")).status).toBe(429);
  });

  it("ignores a forged client-IP header", async () => {
    const forged = (ip: string) =>
      limited.app.request(
        "/api/auth/sign-in/email",
        {
          method: "POST",
          headers: { "content-type": "application/json", origin: ORIGIN, "x-magnisale-client-ip": ip },
          body: JSON.stringify({ email: "a@example.com", password: "wrong wrong wrong" }),
        },
        { incoming: { socket: { remoteAddress: "203.0.113.9" } } },
      );
    expect((await forged("198.51.100.1")).status).toBe(401);
    expect((await forged("198.51.100.2")).status).toBe(429);
  });
});
