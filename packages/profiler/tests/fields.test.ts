import { describe, expect, it } from "vitest";
import {
  applyFieldValue,
  FIELDS,
  getField,
  parseFieldValue,
  sameValue,
  SECTIONS,
  type CollectionItem,
  type FieldDef,
  type SectionData,
  type Source,
} from "../src/index.js";

const owner: Source = { kind: "owner", label: "You", at: "2026-11-22T10:00:00.000Z" };
const website: Source = { kind: "website", label: "magnisale.com", at: "2026-11-20T10:00:00.000Z" };

function field(path: string): FieldDef {
  const def = getField(path);
  if (!def) throw new Error(`No field ${path}`);
  return def;
}

function parsed(path: string, input: unknown) {
  const result = parseFieldValue(field(path), input);
  if (!result.ok) throw new Error(result.message);
  return result.value;
}

describe("registry", () => {
  it("weights core sections at 80 and flexible sections at 20", () => {
    const core = new Set<string>(SECTIONS.filter((s) => s.core).map((s) => s.id));
    const sum = (list: FieldDef[]) => list.reduce((total, f) => total + f.weight, 0);
    expect(sum(FIELDS.filter((f) => core.has(f.section)))).toBe(80);
    expect(sum(FIELDS.filter((f) => !core.has(f.section)))).toBe(20);
  });

  it("has unique paths and a field in every section", () => {
    expect(new Set(FIELDS.map((f) => f.path)).size).toBe(FIELDS.length);
    for (const section of SECTIONS) {
      expect(FIELDS.some((f) => f.section === section.id)).toBe(true);
    }
  });
});

describe("parseFieldValue", () => {
  it("adds a scheme to a bare domain", () => {
    expect(parsed("contact.website", "magnisale.com")).toBe("https://magnisale.com");
  });

  it.each(["javascript:alert(1)", "data:text/html,x", "ftp://example.com", "not a url"])(
    "refuses %s as a web address",
    (input) => {
      expect(parseFieldValue(field("contact.website"), input).ok).toBe(false);
    },
  );

  it("refuses a javascript: link in social links", () => {
    const result = parseFieldValue(field("contact.socialLinks"), [{ label: "x", url: "javascript:alert(1)" }]);
    expect(result.ok).toBe(false);
  });

  it("refuses a future founding year", () => {
    expect(parseFieldValue(field("identity.yearFounded"), new Date().getUTCFullYear() + 1).ok).toBe(false);
    expect(parsed("identity.yearFounded", "2019")).toBe(2019);
  });

  it("drops blank and repeated tags", () => {
    expect(parsed("story.values", ["Trust", " ", "trust", "Speed"])).toEqual(["Trust", "Speed"]);
  });

  it("drops blank location parts", () => {
    expect(parsed("identity.headquarters", { country: "Nigeria", state: " ", city: "Lagos" })).toEqual({
      country: "Nigeria",
      city: "Lagos",
    });
  });

  it("refuses a typed value for the logo", () => {
    expect(parseFieldValue(field("identity.logo"), "https://example.com/logo.png").ok).toBe(false);
  });

  it("requires a name on each collection entry", () => {
    const result = parseFieldValue(field("offerings.items"), [{ values: { description: "No name" } }]);
    expect(result).toEqual({ ok: false, message: "Each product or service needs a name." });
  });

  it("ignores unknown item fields", () => {
    expect(parsed("offerings.items", [{ values: { name: "Agents", injected: "x" } }])).toEqual([
      { values: { name: "Agents" } },
    ]);
  });
});

describe("applyFieldValue", () => {
  const newId = () => "new-id";

  it("keeps the original source when the value did not change", () => {
    const section: SectionData = { oneLiner: { value: "We build agents.", source: website } };
    const next = applyFieldValue(section, field("identity.oneLiner"), "We build agents.", owner, newId);
    expect(next.oneLiner?.source).toEqual(website);
  });

  it("records the owner when the value changed", () => {
    const section: SectionData = { oneLiner: { value: "We build agents.", source: website } };
    const next = applyFieldValue(section, field("identity.oneLiner"), "We build AI agents.", owner, newId);
    expect(next.oneLiner).toEqual({ value: "We build AI agents.", source: owner });
  });

  it("removes a cleared or emptied field", () => {
    const section: SectionData = { values: { value: ["Trust"], source: owner } };
    expect(applyFieldValue(section, field("story.values"), null, owner, newId).values).toBeUndefined();
    expect(applyFieldValue(section, field("story.values"), [], owner, newId).values).toBeUndefined();
  });

  it("keeps id and source of unchanged entries and stamps only the edited one", () => {
    const items: CollectionItem[] = [
      { id: "a", values: { name: "Agents" }, source: website },
      { id: "b", values: { name: "Workflows" }, source: website },
    ];
    const section: SectionData = { items: { value: items, source: website } };
    const next = applyFieldValue(
      section,
      field("offerings.items"),
      [
        { id: "a", values: { name: "Agents" } },
        { id: "b", values: { name: "Automated workflows" } },
        { values: { name: "Training" } },
      ],
      owner,
      newId,
    );
    const saved = next.items?.value as CollectionItem[];
    expect(saved[0]).toEqual(items[0]);
    expect(saved[1]).toEqual({ id: "b", values: { name: "Automated workflows" }, source: owner });
    expect(saved[2]).toEqual({ id: "new-id", values: { name: "Training" }, source: owner });
  });

  it("does not trust an id from another entry list", () => {
    const section: SectionData = {};
    const next = applyFieldValue(section, field("offerings.items"), [{ id: "forged", values: { name: "X" } }], owner, newId);
    expect((next.items?.value as CollectionItem[])[0]?.id).toBe("new-id");
  });
});

describe("sameValue", () => {
  it("ignores key order, as jsonb reorders keys", () => {
    expect(sameValue({ city: "Lagos", country: "Nigeria" }, { country: "Nigeria", city: "Lagos" })).toBe(true);
    expect(sameValue(["a", "b"], ["b", "a"])).toBe(false);
  });
});
