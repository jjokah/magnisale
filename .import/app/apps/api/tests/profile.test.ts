import sharp from "sharp";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { orgAssets, organizations, profileSections, sessions, users } from "../src/db/schema.js";
import { Browser, createTestApp, resetDb, signedUp, type TestApp } from "./helpers.js";

let t: TestApp;

beforeAll(async () => {
  t = await createTestApp();
});
afterAll(async () => {
  await t.app.close();
});
beforeEach(async () => {
  await resetDb(t.app);
});

const png = () =>
  sharp({ create: { width: 800, height: 400, channels: 3, background: "#1a3af5" } }).png().toBuffer();

describe("profile", () => {
  it("starts with the company name as the brand name", async () => {
    const browser = await signedUp(t.app);
    const profile = (await browser.get("/profile")).json();
    expect(profile.sections.identity.brandName.value).toBe("Acme Foods");
    expect(profile.sections.identity.brandName.source.kind).toBe("owner");
    expect(Object.keys(profile.sections)).toHaveLength(10);
  });

  it("saves, normalises and clears a field", async () => {
    const browser = await signedUp(t.app);
    const saved = await browser.patch("/profile/fields", { path: "contact.website", value: "acme.ng" });
    expect(saved.json().field.value).toBe("https://acme.ng");
    expect((await browser.get("/profile")).json().sections.contact.website.source.kind).toBe("owner");

    await browser.patch("/profile/fields", { path: "contact.website", value: null });
    expect((await browser.get("/profile")).json().sections.contact.website).toBeUndefined();
  });

  it("refuses invalid values and unknown fields", async () => {
    const browser = await signedUp(t.app);
    const bad = await browser.patch("/profile/fields", { path: "contact.website", value: "javascript:alert(1)" });
    expect(bad.statusCode).toBe(422);
    expect((await browser.patch("/profile/fields", { path: "nope.nope", value: "x" })).statusCode).toBe(404);
    expect((await browser.patch("/profile/fields", { path: "identity.logo", value: "x" })).statusCode).toBe(422);
  });

  it("gives new collection entries ids and keeps them across saves", async () => {
    const browser = await signedUp(t.app);
    const first = await browser.patch("/profile/fields", {
      path: "offerings.items",
      value: [{ values: { name: "Catering", benefits: ["Fresh", "On time"] } }],
    });
    const item = first.json().field.value[0];
    expect(item.id).toBeTruthy();

    const second = await browser.patch("/profile/fields", {
      path: "offerings.items",
      value: [{ id: item.id, values: item.values }, { values: { name: "Meal plans" } }],
    });
    expect(second.json().field.value[0]).toEqual(item);
    expect(second.json().field.value).toHaveLength(2);
  });

  it("does not lose either of two concurrent saves to one section", async () => {
    const browser = await signedUp(t.app);
    await Promise.all([
      browser.patch("/profile/fields", { path: "story.mission", value: "Feed Lagos well." }),
      browser.patch("/profile/fields", { path: "story.about", value: "We cook. We deliver. We care." }),
      browser.patch("/profile/fields", { path: "story.values", value: ["Fresh"] }),
    ]);
    const { story } = (await browser.get("/profile")).json().sections;
    expect(story.mission.value).toBe("Feed Lagos well.");
    expect(story.about.value).toBe("We cook. We deliver. We care.");
    expect(story.values.value).toEqual(["Fresh"]);
  });

  it("requires sign-in", async () => {
    expect((await new Browser(t.app).get("/profile")).statusCode).toBe(401);
  });
});

describe("organisation isolation", () => {
  it("keeps each organisation's profile and logo to itself", async () => {
    const a = await signedUp(t.app, "a@example.com", "Alpha");
    const b = await signedUp(t.app, "b@example.com", "Beta");

    await a.patch("/profile/fields", { path: "story.mission", value: "Alpha's secret mission" });
    await a.upload("/org/logo", "logo.png", "image/png", await png());

    const seen = (await b.get("/profile")).json();
    expect(seen.sections.identity.brandName.value).toBe("Beta");
    expect(seen.sections.story.mission).toBeUndefined();
    expect((await b.get("/org/logo")).statusCode).toBe(404);
    expect((await b.get("/org/export.json")).body).not.toContain("secret");
  });
});

describe("logo", () => {
  it("re-encodes and shrinks an upload", async () => {
    const browser = await signedUp(t.app);
    expect((await browser.upload("/org/logo", "logo.png", "image/png", await png())).statusCode).toBe(200);

    const logo = await browser.get("/org/logo");
    expect(logo.headers["content-type"]).toContain("image/png");
    const meta = await sharp(logo.rawPayload).metadata();
    expect(meta.width).toBe(512);
    expect((await browser.get("/profile")).json().sections.identity.logo.value.asset).toBe("logo");
  });

  it("refuses SVG and non-images", async () => {
    const browser = await signedUp(t.app);
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect((await browser.upload("/org/logo", "logo.svg", "image/svg+xml", svg)).statusCode).toBe(422);
    expect((await browser.upload("/org/logo", "logo.png", "image/png", Buffer.from("not an image"))).statusCode).toBe(422);
  });

  it("removes the logo and its field", async () => {
    const browser = await signedUp(t.app);
    await browser.upload("/org/logo", "logo.png", "image/png", await png());
    await browser.delete("/org/logo");
    expect((await browser.get("/org/logo")).statusCode).toBe(404);
    expect((await browser.get("/profile")).json().sections.identity.logo).toBeUndefined();
  });
});

describe("organisation settings", () => {
  it("exports everything as a download", async () => {
    const browser = await signedUp(t.app);
    await browser.patch("/profile/fields", { path: "story.mission", value: "Feed Lagos well." });
    const response = await browser.get("/org/export.json");
    expect(response.headers["content-disposition"]).toContain("attachment");
    const data = response.json();
    expect(data.organization.name).toBe("Acme Foods");
    expect(data.members[0].email).toBe("owner@example.com");
    expect(data.profile.sections.story.mission.value).toBe("Feed Lagos well.");
    expect(response.body).not.toContain("password");
  });

  it("deletes nothing unless the exact name is typed", async () => {
    const browser = await signedUp(t.app);
    expect((await browser.delete("/org", { confirmName: "acme" })).statusCode).toBe(422);
    expect(await t.app.ctx.db.select().from(organizations)).toHaveLength(1);
  });

  it("deletes the organisation and every trace of it, and no one else's", async () => {
    const a = await signedUp(t.app, "a@example.com", "Alpha");
    const b = await signedUp(t.app, "b@example.com", "Beta");
    await a.upload("/org/logo", "logo.png", "image/png", await png());

    expect((await a.delete("/org", { confirmName: "Alpha" })).statusCode).toBe(200);

    const { db } = t.app.ctx;
    expect(await db.select().from(organizations)).toHaveLength(1);
    expect(await db.select().from(users)).toHaveLength(1);
    expect(await db.select().from(sessions)).toHaveLength(1);
    expect(await db.select().from(orgAssets)).toHaveLength(0);
    expect(await db.select().from(profileSections)).toHaveLength(10);
    expect((await a.get("/auth/me")).statusCode).toBe(401);
    expect((await b.get("/profile")).json().sections.identity.brandName.value).toBe("Beta");
  });
});
