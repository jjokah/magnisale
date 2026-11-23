import sharp from "sharp";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { companies, sessions, users } from "@magnisale/db";
import { Browser, createTestApp, resetDb, signedUp, type TestApp } from "./helpers.js";

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

const png = () => sharp({ create: { width: 800, height: 400, channels: 3, background: "#1a3af5" } }).png().toBuffer();
const profile = async (browser: Browser) => (await browser.get("/profile")).json();
const count = async (table: string) => Number((await t.owner.query(`select count(*) from ${table}`)).rows[0].count);

describe("profile", () => {
  it("starts with the company name as the brand name", async () => {
    const browser = await signedUp(t);
    const data = await profile(browser);
    expect(data.sections.identity.brandName.value).toBe("Acme Foods");
    expect(data.sections.identity.brandName.source.kind).toBe("owner");
    expect(Object.keys(data.sections)).toHaveLength(10);
  });

  it("saves, normalises and clears a field", async () => {
    const browser = await signedUp(t);
    const saved = await browser.patch("/profile/fields", { path: "contact.website", value: "acme.ng" });
    expect((await saved.json()).field.value).toBe("https://acme.ng");
    expect((await profile(browser)).sections.contact.website.source.kind).toBe("owner");

    await browser.patch("/profile/fields", { path: "contact.website", value: null });
    expect((await profile(browser)).sections.contact.website).toBeUndefined();
  });

  it("refuses invalid values and unknown fields", async () => {
    const browser = await signedUp(t);
    const bad = await browser.patch("/profile/fields", { path: "contact.website", value: "javascript:alert(1)" });
    expect(bad.status).toBe(422);
    expect((await browser.patch("/profile/fields", { path: "nope.nope", value: "x" })).status).toBe(404);
    expect((await browser.patch("/profile/fields", { path: "identity.logo", value: "x" })).status).toBe(422);
  });

  it("gives new collection entries ids and keeps them across saves", async () => {
    const browser = await signedUp(t);
    const first = await browser.patch("/profile/fields", {
      path: "offerings.items",
      value: [{ values: { name: "Catering", benefits: ["Fresh", "On time"] } }],
    });
    const item = (await first.json()).field.value[0];
    expect(item.id).toBeTruthy();

    const second = await browser.patch("/profile/fields", {
      path: "offerings.items",
      value: [{ id: item.id, values: item.values }, { values: { name: "Meal plans" } }],
    });
    const saved = (await second.json()).field.value;
    expect(saved[0]).toEqual(item);
    expect(saved).toHaveLength(2);
  });

  it("does not lose either of two concurrent saves to one section", async () => {
    const browser = await signedUp(t);
    await Promise.all([
      browser.patch("/profile/fields", { path: "story.mission", value: "Feed Lagos well." }),
      browser.patch("/profile/fields", { path: "story.about", value: "We cook. We deliver. We care." }),
      browser.patch("/profile/fields", { path: "story.values", value: ["Fresh"] }),
    ]);
    const { story } = (await profile(browser)).sections;
    expect(story.mission.value).toBe("Feed Lagos well.");
    expect(story.about.value).toBe("We cook. We deliver. We care.");
    expect(story.values.value).toEqual(["Fresh"]);
  });

  it("requires sign-in", async () => {
    expect((await new Browser(t).get("/profile")).status).toBe(401);
  });

  it("refuses an oversized edit", async () => {
    const browser = await signedUp(t);
    const response = await browser.patch("/profile/fields", { path: "story.mission", value: "x".repeat(3 * 1024 * 1024) });
    expect(response.status).toBe(413);
  });
});

describe("company isolation", () => {
  it("keeps each company's profile and logo to itself", async () => {
    const a = await signedUp(t, "a@example.com", "Alpha");
    const b = await signedUp(t, "b@example.com", "Beta");

    await a.patch("/profile/fields", { path: "story.mission", value: "Alpha's secret mission" });
    await a.upload("/company/logo", "logo.png", "image/png", await png());

    const seen = await profile(b);
    expect(seen.sections.identity.brandName.value).toBe("Beta");
    expect(seen.sections.story.mission).toBeUndefined();
    expect((await b.get("/company/logo")).status).toBe(404);
    expect(await (await b.get("/company/export.json")).text()).not.toContain("secret");
  });
});

describe("logo", () => {
  it("re-encodes and shrinks an upload", async () => {
    const browser = await signedUp(t);
    expect((await browser.upload("/company/logo", "logo.png", "image/png", await png())).status).toBe(200);

    const logo = await browser.get("/company/logo");
    expect(logo.headers.get("content-type")).toContain("image/png");
    const meta = await sharp(Buffer.from(await logo.arrayBuffer())).metadata();
    expect(meta.width).toBe(512);
    expect((await profile(browser)).sections.identity.logo.value.asset).toBe("logo");
  });

  it("refuses SVG and non-images", async () => {
    const browser = await signedUp(t);
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect((await browser.upload("/company/logo", "logo.svg", "image/svg+xml", svg)).status).toBe(422);
    expect((await browser.upload("/company/logo", "logo.png", "image/png", Buffer.from("not an image"))).status).toBe(422);
  });

  it("refuses a file over the limit", async () => {
    const browser = await signedUp(t);
    const response = await browser.upload("/company/logo", "logo.png", "image/png", Buffer.alloc(6 * 1024 * 1024));
    expect(response.status).toBe(413);
  });

  it("removes the logo and its field", async () => {
    const browser = await signedUp(t);
    await browser.upload("/company/logo", "logo.png", "image/png", await png());
    await browser.delete("/company/logo");
    expect((await browser.get("/company/logo")).status).toBe(404);
    expect((await profile(browser)).sections.identity.logo).toBeUndefined();
  });
});

describe("company settings", () => {
  it("exports everything as a download", async () => {
    const browser = await signedUp(t);
    await browser.patch("/profile/fields", { path: "story.mission", value: "Feed Lagos well." });
    const response = await browser.get("/company/export.json");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    const text = await response.text();
    const data = JSON.parse(text);
    expect(data.company.name).toBe("Acme Foods");
    expect(data.members[0].email).toBe("owner@example.com");
    expect(data.profile.sections.story.mission.value).toBe("Feed Lagos well.");
    expect(text).not.toContain("password");
  });

  it("deletes nothing unless the exact name is typed", async () => {
    const browser = await signedUp(t);
    expect((await browser.delete("/company", { confirmName: "acme" })).status).toBe(422);
    expect(await t.deps.db.select().from(companies)).toHaveLength(1);
  });

  it("deletes the company and every trace of it, and no one else's", async () => {
    const a = await signedUp(t, "a@example.com", "Alpha");
    const b = await signedUp(t, "b@example.com", "Beta");
    await a.upload("/company/logo", "logo.png", "image/png", await png());

    expect((await a.delete("/company", { confirmName: "Alpha" })).status).toBe(200);

    const { db } = t.deps;
    expect(await db.select().from(companies)).toHaveLength(1);
    expect(await db.select().from(users)).toHaveLength(1);
    expect(await db.select().from(sessions)).toHaveLength(1);
    expect(await count("company_assets")).toBe(0);
    expect(await count("profile_sections")).toBe(10);
    expect((await a.get("/account/me")).status).toBe(401);
    expect((await profile(b)).sections.identity.brandName.value).toBe("Beta");
  });
});
