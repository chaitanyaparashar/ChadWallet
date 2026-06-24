import { describe, it, expect } from "vitest";
import { computeMinReceived } from "./jupiter";

describe("computeMinReceived", () => {
  it("applies slippage in bps", () => {
    expect(computeMinReceived("1000000", 50)).toBe("995000"); // 0.5%
  });
  it("handles zero slippage", () => {
    expect(computeMinReceived("1000000", 0)).toBe("1000000");
  });
});
