"use client";

import { useState } from "react";
import { HoldersTable } from "@/components/HoldersTable";
import { LiveTrades } from "@/components/LiveTrades";
import type { Holder, Trade } from "@/types";

type Tab = "holders" | "trades";

/**
 * Tabbed switcher between the holders table and the live trades feed,
 * shown in the trade page's middle column below the price chart.
 */
export function TradeTabs({ holders, trades }: { holders: Holder[]; trades: Trade[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("holders");

  return (
    <div className="cw-card flex flex-1 flex-col overflow-hidden">
      <div className="flex border-b border-border">
        <button
          type="button"
          data-testid="tab-holders"
          onClick={() => setActiveTab("holders")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "holders"
              ? "border-b-2 border-accent text-foreground"
              : "cw-text-muted hover:text-foreground"
          }`}
        >
          Holders
        </button>
        <button
          type="button"
          data-testid="tab-trades"
          onClick={() => setActiveTab("trades")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "trades"
              ? "border-b-2 border-accent text-foreground"
              : "cw-text-muted hover:text-foreground"
          }`}
        >
          Swaps
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "holders" ? (
          <HoldersTable holders={holders} />
        ) : (
          <LiveTrades trades={trades} />
        )}
      </div>
    </div>
  );
}
