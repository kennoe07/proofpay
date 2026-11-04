import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-4 z-20 mx-auto mt-4 w-full max-w-3xl px-4">
      <nav className="flex items-center justify-between gap-4 rounded-full border border-line bg-surface/80 py-2 pr-2 pl-5 shadow-lg shadow-black/30 backdrop-blur light:shadow-black/5">
        <Link href="/" aria-label="ProofPay home">
          <Logo />
        </Link>
        <div className="flex items-center gap-3 text-sm text-muted">
          {children}
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85"
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
