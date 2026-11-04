import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { InvoiceForm } from "@/components/invoice-form";
import { isTestnet } from "@/lib/chain";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "New invoice · ProofPay" };

export default function NewInvoicePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-muted transition-colors hover:text-foreground">
        ← Back to invoices
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">New invoice</h1>
      <p className="mt-2 text-muted">
        Your client pays this in USDC on Base. Payment goes straight to your wallet.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" aria-busy />}>
          <SignedInForm />
        </Suspense>
      </div>
    </div>
  );
}

async function SignedInForm() {
  if (!(await getSession())) redirect("/dashboard");
  return <InvoiceForm defaultNetwork={isTestnet ? "test" : "live"} />;
}
