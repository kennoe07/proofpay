import { getChain } from "@/lib/chain";
import { easscanUrl } from "@/lib/eas-schema";
import { shortAddress } from "@/lib/format";
import type { Invoice } from "@/lib/supabase-server";

// The onchain receipt for a paid invoice, linking the delivered work to the payment.
export function ReceiptCard({ invoice }: { invoice: Invoice }) {
  if (!invoice.attestation_uid) return null;
  const network = getChain(invoice.chain_id)?.name ?? "Base";
  const verifyUrl = easscanUrl(invoice.chain_id, invoice.attestation_uid);
  const evidenceName = invoice.evidence_url
    ? decodeURIComponent(invoice.evidence_url.split("/").pop() ?? "").replace(/^\d+-/, "")
    : null;

  return (
    <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-3 rounded-2xl bg-accent/10 px-4 py-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div className="text-sm">
          <p className="font-medium text-accent">Onchain receipt · attested on {network}</p>
          <p className="text-muted">ProofPay checked this payment and recorded it with the delivered work.</p>
        </div>
      </div>

      <dl className="mt-6 divide-y divide-line rounded-2xl border border-line text-sm">
        {invoice.evidence_url && (
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="shrink-0 text-muted">Delivered</dt>
            <dd className="min-w-0">
              <a
                href={invoice.evidence_url}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-accent underline-offset-4 hover:underline"
              >
                {invoice.evidence_hash ? evidenceName || "View file" : invoice.evidence_url}
              </a>
            </dd>
          </div>
        )}
        {invoice.evidence_hash && (
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-muted">File fingerprint</dt>
            <dd className="font-mono" title={invoice.evidence_hash}>
              {shortAddress(invoice.evidence_hash)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-muted">Receipt</dt>
          <dd className="font-mono" title={invoice.attestation_uid}>
            {shortAddress(invoice.attestation_uid)}
          </dd>
        </div>
      </dl>

      {verifyUrl && (
        <a
          href={verifyUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
        >
          Verify on EAS ↗
        </a>
      )}
    </section>
  );
}
