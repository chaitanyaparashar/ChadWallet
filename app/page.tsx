"use client";

import { TokenBanner } from "@/components/TokenBanner";
import { LandingTopBar } from "@/components/LandingTopBar";
import { Hero } from "@/components/Hero";
import { StatsSection } from "@/components/StatsSection";
import { OrbitSection } from "@/components/OrbitSection";
import { FeatureSections } from "@/components/FeatureSections";
import { Footer } from "@/components/Footer";
import { DemoDataPill } from "@/components/DemoDataPill";
import { useTrending } from "@/lib/hooks/useTrending";

export default function Home() {
  const { tokens, degraded } = useTrending();
  const launchMint = tokens[0]?.mint;

  return (
    <div className="relative flex flex-1 flex-col">
      <LandingTopBar />
      <Hero launchMint={launchMint} />
      <StatsSection />
      <OrbitSection launchMint={launchMint} />
      <FeatureSections />
      <TokenBanner tokens={tokens} direction="right" />
      <Footer />
      {degraded && <DemoDataPill />}
    </div>
  );
}
