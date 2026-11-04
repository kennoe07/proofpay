"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelInvoice } from "@/app/dashboard/actions";
import { ClaimPaymentForm } from "@/components/claim-payment-form";
import { CopyLink } from "@/components/copy-link";

// Shown only to the freelancer who owns an unpaid invoice.
export function OwnerTools({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [cancelling, startCancel] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    if (!window.confirm("Cancel this invoice? Your client won't be able to pay it, and this can't be undone.")) {
      return;
    }
    setError(null);
    startCancel(async () => {
      const result = await cancelInvoice(invoiceId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Your invoice</p>
          <p className="text-sm text-muted">Share the link with your client, or cancel it if it was a mistake.</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
          <button
            type="button"
            onClick={cancel}
            disabled={cancelling}
            className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:text-red-500 disabled:opacity-60"
          >
            {cancelling ? "Cancelling…" : "Cancel invoice"}
          </button>
          <CopyLink path={`/i/${invoiceId}`} />
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}
      <ClaimPaymentForm invoiceId={invoiceId} />
    </div>
  );
}
