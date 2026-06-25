const APP_STORE_URL = "https://apps.apple.com/us/app/chadwallet/id6757367474";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

/**
 * Store download links. No badge image assets yet, so these are styled
 * text buttons that read like badges (icon glyph + two-line label).
 */
export function StoreButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 rounded-xl border border-border bg-panel px-4 py-2.5 transition-colors hover:border-accent/60 hover:bg-white/5"
      >
        <svg
          viewBox="0 0 384 512"
          aria-hidden="true"
          className="h-6 w-6 flex-none fill-foreground"
        >
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
        <span className="flex flex-col leading-tight">
          <span className="text-[0.65rem] uppercase tracking-wide text-muted">
            Download on the
          </span>
          <span className="text-sm font-semibold text-foreground">App Store</span>
        </span>
      </a>
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 rounded-xl border border-border bg-panel px-4 py-2.5 transition-colors hover:border-accent/60 hover:bg-white/5"
      >
        <svg
          viewBox="0 0 512 512"
          aria-hidden="true"
          className="h-6 w-6 flex-none fill-foreground"
        >
          <path d="M99.6 39.6c-7.5 7.9-12 20.1-12 35.8v361.2c0 15.7 4.5 27.9 12 35.8l2.1 2.1 202.9-202.9v-31.2L101.7 37.5z" />
          <path d="M373.7 285l-69-69-202.9 202.9c7.8 8.3 20.6 9.3 34.9 1.1z" />
          <path d="M373.7 227 304.6 158 134.7 23.8c-14.3-8.2-27.1-7.2-34.9 1.1L304.7 227z" />
          <path d="M412.1 256 373.7 227l-69 69 69 69 38.4-29c19.6-11.3 19.6-44.7 0-56z" />
        </svg>
        <span className="flex flex-col leading-tight">
          <span className="text-[0.65rem] uppercase tracking-wide text-muted">Get it on</span>
          <span className="text-sm font-semibold text-foreground">Google Play</span>
        </span>
      </a>
    </div>
  );
}
