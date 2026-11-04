// ProofPay's mark: a receipt with a check, for "paid and verified".
// Keep in sync with src/app/icon.svg (the browser tab icon).
export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`text-accent ${className}`} aria-hidden>
      <path
        fill="currentColor"
        d="M6 2.5h12A1.5 1.5 0 0 1 19.5 4v17l-2.5-1.6-2.5 1.6-2.5-1.6-2.5 1.6L7 19.4 4.5 21V4A1.5 1.5 0 0 1 6 2.5Z"
      />
      <path
        d="m8.5 11 2.5 2.5L15.5 9"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <LogoMark />
      <span>ProofPay</span>
    </span>
  );
}
