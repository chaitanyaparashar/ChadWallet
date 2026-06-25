import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrendingList } from "./TrendingList";
const tokens = [{ mint: "M1", symbol: "SOL", name: "Solana", priceUsd: 150, change24h: 2 },
                { mint: "M2", symbol: "BONK", name: "Bonk", priceUsd: 0.00002, change24h: -3 }];
describe("TrendingList", () => {
  it("links each token and highlights active", () => {
    render(<TrendingList tokens={tokens} activeMint="M2" />);
    expect(screen.getByRole("link", { name: /SOL/ })).toHaveAttribute("href", "/trade/M1");
    expect(screen.getByTestId("row-M2")).toHaveAttribute("data-active", "true");
  });
});
