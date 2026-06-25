/**
 * Subtle fixed pill surfaced only when the trending feed is running on mock
 * data (no live API key configured). Non-blocking, dismiss-free — it's
 * informational chrome for reviewers, not a user-facing warning.
 */
export function DemoDataPill() {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-panel/95 px-3.5 py-1.5 text-xs text-muted shadow-lg shadow-black/40 backdrop-blur">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 flex-none rounded-full bg-accent"
        />
        Demo data — add API keys for live prices
      </div>
    </div>
  );
}
