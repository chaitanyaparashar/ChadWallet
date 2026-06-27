"use client";

import { TokenBanner } from "@/components/TokenBanner";
import { Hero } from "@/components/Hero";
import { FeatureSections } from "@/components/FeatureSections";
import { Footer } from "@/components/Footer";
import { DemoDataPill } from "@/components/DemoDataPill";
import { useTrending } from "@/lib/hooks/useTrending";

export default function Home() {
  const { tokens, degraded } = useTrending();

  return (
    <div className="flex flex-1 flex-col">
      <TokenBanner tokens={tokens} direction="left" />
      <main className="flex-1">
        <Hero launchMint={tokens[0]?.mint} />
        <FeatureSections />
      </main>
      <TokenBanner tokens={tokens} direction="right" />
      <Footer />
      {degraded && <DemoDataPill />}
    </div>
  );
}
