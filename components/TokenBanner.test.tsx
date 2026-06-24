import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TokenBanner } from "./TokenBanner";

const tokens = [{ mint: "M1", symbol: "SOL", name: "Solana", priceUsd: 150, change24h: 2.5 }];

describe("TokenBanner", () => {
  it("renders a token and links to its trade page", () => {
    render(<TokenBanner tokens={tokens} direction="left" />);
    expect(screen.getAllByText(/SOL/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/trade/M1");
  });
});
