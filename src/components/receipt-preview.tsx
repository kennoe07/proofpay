// Illustrative receipt for the landing page. Every value here is example data.
//
// On the landing page it "builds itself" the way ProofPay works: each hash types in and gets
// a check, then the attestation stamps. The sequence is pure CSS (see "Receipt sequence" in
// globals.css), waits until the receipt is on screen, and is skipped for reduced motion.
const rows = [
  { label: "Invoice hash", value: "0x8f3a…c21e" },
  { label: "Deliverable hash", value: "0x1b77…09ad" },
  { label: "Payment tx", value: "0x4c2e…77f0" },
];

// Seconds after the receipt appears: each row types, then ticks, then the attestation lands.
const ROW_START = 0.55;
const ROW_STEP = 0.45;
const ATTEST_AT = ROW_START + rows.length * ROW_STEP + 0.1;

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as React.CSSProperties;

function Check({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ReceiptPreview() {
  return (
    <div className="relative h-full">
      <div className="absolute -inset-6 rounded-[2rem] bg-accent/10 blur-3xl" aria-hidden />
      <figure className="relative h-full rounded-3xl border border-line bg-surface p-6 shadow-2xl shadow-black/50 light:shadow-black/10">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest text-muted">PROOFPAY RECEIPT</span>
          <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
            Example
          </span>
        </div>

        <p className="mt-6 text-sm text-muted">Logo and brand kit · Lumen Coffee</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight">
          450.00 <span className="text-xl font-medium text-muted">USDC</span>
        </p>
        <p className="mt-1 text-sm text-muted">Paid 3 Nov 2026 on Base</p>

        <dl className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface-2/60">
          {rows.map((row, i) => {
            const start = ROW_START + i * ROW_STEP;
            return (
              <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <dt className="text-muted">{row.label}</dt>
                <dd className="flex items-center gap-2">
                  <span className="rcpt-type font-mono text-foreground" style={delay(start)}>
                    {row.value}
                  </span>
                  <span
                    className="rcpt-tick grid size-4 shrink-0 place-items-center rounded-full bg-accent/15 text-accent"
                    style={delay(start + 0.3)}
                  >
                    <Check className="size-2.5" />
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>

        <div
          className="rcpt-bar mt-6 flex items-center gap-3 rounded-xl bg-accent/10 px-4 py-3"
          style={delay(ATTEST_AT)}
        >
          <span
            className="stamp grid size-7 shrink-0 place-items-center rounded-full bg-accent text-accent-ink"
            style={delay(ATTEST_AT + 0.2)}
          >
            <Check className="size-4" />
          </span>
          <div className="text-sm">
            <p className="font-medium text-accent">Attested on Base</p>
            <p className="text-muted">Anyone can verify this receipt on EAS</p>
          </div>
        </div>
      </figure>
    </div>
  );
}
