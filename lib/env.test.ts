import { describe, it, expect } from "vitest";
import { isPlaceholder } from "./env";

describe("isPlaceholder", () => {
  it("treats undefined as placeholder", () => { expect(isPlaceholder(undefined)).toBe(true); });
  it("treats empty string as placeholder", () => { expect(isPlaceholder("")).toBe(true); });
  it("treats placeholder- prefixed value as placeholder", () => {
    expect(isPlaceholder("placeholder-birdeye-key")).toBe(true);
  });
  it("treats a real key as configured", () => {
    expect(isPlaceholder("be_abc123")).toBe(false);
  });
});
