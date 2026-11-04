import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <LogoMark className="size-12" />
        <p className="mt-6 font-mono text-sm text-muted">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">We couldn&apos;t find that page</h1>
        <p className="mt-3 text-muted">
          The invoice, profile or page you&apos;re looking for doesn&apos;t exist, or the link is incomplete.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition hover:brightness-110"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            Your dashboard
          </Link>
        </div>
      </main>
    </>
  );
}
