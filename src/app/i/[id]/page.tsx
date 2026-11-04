import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClaimPaymentForm } from "@/components/claim-payment-form";
import { CopyLink } from "@/components/copy-link";
import { PayPanelLoader } from "@/components/pay-panel-loader";
import { StatusBadge } from "@/components/status-badge";
import { chain, explorerTxUrl, isTestnet } from "@/lib/chain";
import { formatDate, formatUsdc, shortAddress } from "@/lib/format";
import { getSession } from "@/lib/session";
import { supabaseAdmin, type Invoice, type Profile } from "@/lib/supabase-server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadInvoice(id: string) {
  if (!UUID.test(id)) return null;
  const db = supabaseAdmin();
  const { data: invoice } = await db.from("invoices").select("*").eq("id", id).maybeSingle<Invoice>();
  if (!invoice) return null;
  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("wallet_address", invoice.freelancer_address)
    .maybeSingle<Profile>();
  return { invoice, profile };
}

export async function generateMetadata(props: PageProps<"/i/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const found = await loadInvoice(id);
  if (!found) return { title: "Invoice not found · ProofPay" };
  return {
    title: `${found.invoice.title} · ${formatUsdc(found.invoice.amount_units)} USDC · ProofPay`,
  };
}

// The invoice id comes from the request, so the invoice streams in behind Suspense.
export default function InvoicePage(props: PageProps<"/i/[id]">) {
  return (
    <Suspense fallback={<div className="h-[28rem] animate-pulse rounded-3xl bg-surface-2" aria-busy />}>
      <InvoiceView params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function InvoiceView({ params, searchParams }: Pick<PageProps<"/i/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const { created } = await searchParams;
  const found = await loadInvoice(id);
  if (!found) notFound();

  const { invoice, profile } = found;
  const from = profile?.handle ? `@${profile.handle}` : shortAddress(invoice.freelancer_address);
  const session = await getSession();
  const isOwner = session?.address === invoice.freelancer_address;

  return (
    <div className="space-y-6">
      {created === "1" && (
        <div className="flex flex-col gap-4 rounded-3xl border border-accent/40 bg-accent/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Invoice created</p>
            <p className="text-sm text-muted">Send this page&apos;s link to your client.</p>
          </div>
          <CopyLink path={`/i/${invoice.id}`} />
        </div>
      )}

      <article className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs tracking-widest text-muted">PROOFPAY INVOICE</span>
          <StatusBadge status={invoice.status} />
        </div>

        <p className="mt-6 text-sm text-muted">
          {invoice.client_name ? `For ${invoice.client_name} · ` : ""}From {from}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{invoice.title}</h1>
        <p className="mt-4 text-4xl font-semibold tracking-tight">
          {formatUsdc(invoice.amount_units)} <span className="text-xl font-medium text-muted">USDC</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Issued {formatDate(invoice.created_at)} · on {chain.name}
        </p>

        {invoice.description && (
          <p className="mt-6 whitespace-pre-line rounded-2xl border border-line bg-surface-2/60 p-4 text-sm leading-6">
            {invoice.description}
          </p>
        )}

        <dl className="mt-6 divide-y divide-line rounded-2xl border border-line text-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-muted">Pays to</dt>
            <dd className="font-mono">{shortAddress(invoice.freelancer_address)}</dd>
          </div>
          {invoice.paid_at && (
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Paid</dt>
              <dd>
                {formatDate(invoice.paid_at)}
                {invoice.payer_address && (
                  <span className="text-muted"> · from {shortAddress(invoice.payer_address)}</span>
                )}
              </dd>
            </div>
          )}
          {invoice.payment_tx_hash && (
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Payment tx</dt>
              <dd>
                <a
                  href={explorerTxUrl(invoice.payment_tx_hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-accent underline-offset-4 hover:underline"
                >
                  {shortAddress(invoice.payment_tx_hash)}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </article>

      {invoice.status === "unpaid" && (
        <>
          {/* Everyone sees what the client sees; the panel refuses payment from the invoice's own wallet. */}
          <PayPanelLoader
            invoiceId={invoice.id}
            amountUnits={String(invoice.amount_units)}
            payTo={invoice.freelancer_address}
          />
          {isOwner && <ClaimPaymentForm invoiceId={invoice.id} />}
        </>
      )}

      {isTestnet && (
        <p className="text-center text-xs text-muted">
          This invoice is on {chain.name}, a test network. No real money is involved.
        </p>
      )}
    </div>
  );
}
