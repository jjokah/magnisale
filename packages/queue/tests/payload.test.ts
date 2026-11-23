import { describe, expect, it } from "vitest";
import { assertIdsOnly } from "../src/index.js";

describe("job data", () => {
  it("accepts IDs", () => {
    expect(() =>
      assertIdsOnly({ companyId: "5f4c2b0e-9d3a-4a1b-8c7e-2f6d1a0b9c8d", intakeId: "0b1e6f2a-7c4d-4e8f-9a3b-1c2d3e4f5a6b" }),
    ).not.toThrow();
    expect(() => assertIdsOnly({})).not.toThrow();
  });

  it.each([
    [{ text: "Our confidential pitch deck" }],
    [{ companyId: 42 }],
    [{ nested: { id: "5f4c2b0e-9d3a-4a1b-8c7e-2f6d1a0b9c8d" } }],
  ])("refuses customer content in %j", (payload) => {
    expect(() => assertIdsOnly(payload)).toThrow(/IDs only/);
  });
});
