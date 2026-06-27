import Image from "next/image";
import Link from "next/link";

/**
 * ChadWallet brand lockup: the Chad mark plus optional wordmark. Uses the
 * transparent white logo (`/logo/chad.png`) so it sits cleanly on the dark UI.
 * When `href` is set the whole lockup links there (used as a home link on the
 * trade page, which has no other nav).
 */
export function BrandMark({
  size = 32,
  withWordmark = true,
  href,
  className = "",
}: {
  size?: number;
  withWordmark?: boolean;
  href?: string;
  className?: string;
}) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo/chad.png"
        alt="ChadWallet logo"
        width={size}
        height={size}
        priority
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="text-xl font-bold tracking-tight text-foreground">
          Chad<span className="text-accent">Wallet</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }
  return content;
}
