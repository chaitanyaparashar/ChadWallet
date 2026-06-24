import { describe, it, expect, vi, beforeEach } from "vitest";

describe("birdeye adapter", () => {
  beforeEach(() => { vi.resetModules(); vi.unstubAllEnvs(); });

  it("returns degraded mock data when key is placeholder", async () => {
    vi.stubEnv("BIRDEYE_API_KEY", "placeholder-birdeye-key");
    const { getTrending } = await import("./birdeye");
    const r = await getTrending();
    expect(r.degraded).toBe(true);
    expect(r.data.length).toBeGreaterThan(0);
  });

  it("falls back to mock when a real call throws", async () => {
    vi.stubEnv("BIRDEYE_API_KEY", "be_realkey");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const { getTrending } = await import("./birdeye");
    const r = await getTrending();
    expect(r.degraded).toBe(true);
    expect(r.data.length).toBeGreaterThan(0);
  });
});
