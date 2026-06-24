import { describe, it, expect } from "vitest";
import { mockTrending, mockCandles, mockHolders, mockTrades } from "./index";

describe("mock fixtures", () => {
  it("returns at least 8 trending tokens with required fields", () => {
    const t = mockTrending();
    expect(t.length).toBeGreaterThanOrEqual(8);
    expect(t[0]).toHaveProperty("mint");
    expect(t[0]).toHaveProperty("symbol");
    expect(typeof t[0].priceUsd).toBe("number");
  });
  it("is deterministic for the same mint", () => {
    expect(mockCandles("So11111111111111111111111111111111111111112"))
      .toEqual(mockCandles("So11111111111111111111111111111111111111112"));
  });
  it("returns candles with ascending time", () => {
    const c = mockCandles("X");
    expect(c.every((p, i) => i === 0 || p.time > c[i - 1].time)).toBe(true);
  });
  it("holder percentages do not exceed 100", () => {
    const sum = mockHolders("X").reduce((s, h) => s + h.percentage, 0);
    expect(sum).toBeLessThanOrEqual(100);
  });
  it("trades are sorted by descending timestamp", () => {
    const tr = mockTrades("X");
    expect(tr.every((p, i) => i === 0 || p.timestamp <= tr[i - 1].timestamp)).toBe(true);
  });
});
