"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// For the invoice's owner: record a payment made outside the pay panel.
// The server checks the transaction on Base exactly as it does for in-page payments.
export function ClaimPaymentForm({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [txHash, setTxHash] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't confirm that payment.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't confirm that payment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="group rounded-3xl border border-line bg-surface p-6">
      <summary className="cursor-pointer list-none text-sm font-medium">
        Paid outside ProofPay? <span className="text-muted">Add the transaction</span>
      </summary>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <p className="text-sm text-muted">
          Paste the transaction hash. ProofPay checks it on Base before marking this invoice paid.
        </p>
        <input
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          required
          pattern="0x[0-9a-fA-F]{64}"
          placeholder="0x…"
          aria-label="Transaction hash"
          className="w-full rounded-2xl border border-line bg-surface-2/60 px-4 py-3 font-mono text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2 disabled:opacity-60"
        >
          {pending ? "Checking on Base…" : "Check payment"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </form>
    </details>
  );
}
