import { BrandMark } from "@/components/BrandMark";
import { StoreButtons } from "@/components/StoreButtons";
import { PrivyAuthButton } from "@/components/PrivyAuthButton";

/**
 * Transparent top bar over the landing hero, à la fomo: brand on the left,
 * store badges + Login on the right.
 */
export function LandingTopBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
      <BrandMark size={30} />
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <StoreButtons />
        </div>
        <PrivyAuthButton />
      </div>
    </header>
  );
}
