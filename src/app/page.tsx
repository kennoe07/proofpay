import { Logo } from "@/components/logo";
import { ReceiptPreview } from "@/components/receipt-preview";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeaturedTrackRecord } from "@/components/featured-track-record";

// The real track record shown on the landing page.
const FEATURED_HANDLE = "0xknight";

const builtWith = ["Base", "USDC", "Ethereum Attestation Service", "Coinbase Smart Wallet"];

const steps = ["Send a USDC invoice", "Get paid on Base", "Receive an onchain receipt"];

// What ProofPay verifies on Base before a payment counts (see src/lib/verify-payment.ts).
const checks = [
  "Official USDC on Base",
  "Sent to the freelancer's wallet",
  "At least the invoice amount",
  "Made after the invoice was created",
  "Never reused for another invoice",
];

const features = [
  {
    title: "USDC invoices",
    body: "Describe the job, set the amount and share one link. Your client needs nothing but a wallet.",
    icon: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4",
  },
  {
    title: "Payment checked onchain",
    body: "ProofPay confirms the transfer on Base: right token, right wallet, right amount.",
    icon: "M3 7h18v10H3zM3 11h18M7 15h3",
  },
  {
    title: "Delivery evidence",
    body: "Attach the finished work, so the receipt records what was delivered as well as what was paid.",
    icon: "M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2zM8 9h8M8 12h5",
  },
  {
    title: "Attested receipts",
    body: "Each paid job is recorded with the Ethereum Attestation Service, so anyone can verify it.",
    icon: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM9 12l2 2 4-4",
  },
  {
    title: "Public track record",
    body: "Your verified jobs collect on one profile you can send to your next client.",
    icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM4 21a8 8 0 0 1 16 0",
  },
];

function Icon({ d, className = "size-5" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

function ArrowButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-3 rounded-full bg-accent py-1.5 pr-1.5 pl-5 text-sm font-medium text-accent-ink transition hover:brightness-110"
    >
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-accent-ink text-accent transition-transform group-hover:translate-x-0.5">
        <Icon d="M5 12h14M13 6l6 6-6 6" className="size-4" />
      </span>
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[720px]" aria-hidden />
      <div className="bg-glow pointer-events-none absolute inset-x-0 top-0 h-[720px]" aria-hidden />

      <header className="sticky top-4 z-20 mx-auto mt-4 w-full max-w-3xl px-4">
        <nav className="flex items-center justify-between gap-4 rounded-full border border-line bg-surface/80 py-2 pr-2 pl-5 shadow-lg shadow-black/30 backdrop-blur light:shadow-black/5">
          <a href="#" aria-label="ProofPay home">
            <Logo />
          </a>
          <div className="flex items-center gap-3 text-sm text-muted sm:gap-5">
            <a href="#how" className="hidden transition-colors hover:text-foreground sm:inline">
              How it works
            </a>
            <a href="#features" className="hidden transition-colors hover:text-foreground sm:inline">
              Features
            </a>
            <ThemeToggle />
            <a
              href="/dashboard"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85"
            >
              Get started
            </a>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Hero: receipt card beside the intro card. */}
        <section className="grid gap-4 pt-16 lg:grid-cols-[0.85fr_1.15fr] lg:pt-24">
          <div className="order-2 lg:order-1">
            <ReceiptPreview />
          </div>
          <div className="order-1 flex flex-col justify-center rounded-3xl border border-line bg-surface p-8 sm:p-10 lg:order-2">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden />
              Built for freelancers paid in USDC
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Proof of the work.
              <br />
              <span className="text-accent">Proof of the pay.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
              ProofPay links what you delivered to how you were paid. Every job you finish adds to a
              track record your next client can check for themselves.
            </p>
            <div className="mt-8">
              <ArrowButton href="#how">See how it works</ArrowButton>
            </div>
          </div>
        </section>

        {/* Built with */}
        <section className="py-14 text-center">
          <p className="text-xs text-muted">Built with</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {builtWith.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line px-4 py-1.5 text-sm text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Bento grid */}
        <section id="how" className="scroll-mt-28 py-16">
          <div className="text-center">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              From finished work to verified proof
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 p-8 text-emerald-950 md:col-span-3">
              <p className="text-sm font-semibold tracking-tight opacity-80">ProofPay</p>
              <h3 className="mt-16 max-w-xs text-3xl font-semibold tracking-tight">
                Get paid. Keep the proof.
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-950/80">
                Invoices, payments and delivery evidence, tied together in one receipt that lives
                onchain.
              </p>
              <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full border-[28px] border-white/20" aria-hidden />
            </div>

            <div className="rounded-3xl border border-line bg-surface p-8 md:col-span-2">
              <h3 className="text-2xl font-semibold tracking-tight">Three steps</h3>
              <ol className="mt-6 space-y-4">
                {steps.map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-sm">
                    <span className="grid size-6 place-items-center rounded-full bg-accent/15 font-mono text-xs text-accent">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-line bg-surface-2 p-8 md:col-span-1">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon d="M12 3v18M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </span>
              <div className="mt-10">
                <p className="text-3xl font-semibold">0</p>
                <p className="mt-1 text-sm text-muted">USDC held by ProofPay. You&apos;re paid directly.</p>
              </div>
            </div>

            <div className="flex flex-col rounded-3xl border border-line bg-surface p-8 md:col-span-2">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6zM9 12l2 2 4-4" />
              </span>
              <div className="mt-6">
                <h3 className="text-xl font-semibold tracking-tight">Checked, not claimed</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  A job only counts once its payment is confirmed on Base.
                </p>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {checks.map((check) => (
                  <li key={check} className="flex items-center gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                      <Icon d="M5 12.5l4.5 4.5L19 7.5" className="size-3" />
                    </span>
                    {check}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <FeaturedTrackRecord handle={FEATURED_HANDLE} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-28 grid gap-12 py-24 lg:grid-cols-2">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Everything a paid job needs to count.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-muted">
              Screenshots and testimonials are easy to fake. ProofPay gives your work history
              something they can&apos;t: a payment anyone can check.
            </p>
            <div className="mt-8">
              <ArrowButton href="/dashboard">Get started</ArrowButton>
            </div>
          </div>

          <ul className="space-y-4">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-accent/40"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-accent">
                  <Icon d={feature.icon} />
                </span>
                <h3 className="mt-5 text-lg font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="relative border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo className="text-foreground" />
          <p>Built for Vibeathon 02 · Night shift · on Base</p>
        </div>
      </footer>
    </div>
  );
}
