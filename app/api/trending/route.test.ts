import { describe, it, expect, vi } from "vitest";
vi.stubEnv("BIRDEYE_API_KEY", "placeholder-birdeye-key");
import { GET } from "./route";

describe("GET /api/trending", () => {
  it("returns a data array", async () => {
    const res = await GET();
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });
});
