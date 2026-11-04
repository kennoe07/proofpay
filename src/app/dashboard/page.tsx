import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AvatarUploader } from "@/components/avatar-uploader";
import { HandleEditor } from "@/components/handle-editor";
import { HandleForm } from "@/components/handle-form";
import { WalletName } from "@/components/wallet-name";
import { WalletSignIn } from "@/components/wallet-sign-in";
import { NetworkBadge, StatusBadge } from "@/components/status-badge";
import { isTestnetChain } from "@/lib/chain";
import { receiptsEnabled } from "@/lib/eas-schema";
import { formatDate, formatUsdc, isOverdue } from "@/lib/format";
import { getSession } from "@/lib/session";
import { supabaseAdmin, type Invoice, type Profile } from "@/lib/supabase-server";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Dashboard · ProofPay" };

// The session is read per request, so it streams in behind Suspense (Cache Components).
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy>
      <div className="h-16 w-64 animate-pulse rounded-2xl bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-surface-2" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-3xl bg-surface-2" />
    </div>
  );
}

async function Dashboard() {
  const session = await getSession();
  if (!session) return <WalletSignIn />;

  const db = supabaseAdmin();
  const [{ data: profile }, { data: invoices }] = await Promise.all([
    db.from("profiles").select("*").eq("wallet_address", session.address).maybeSingle<Profile>(),
    db
      .from("invoices")
      .select("*")
      .eq("freelancer_address", session.address)
      .order("created_at", { ascending: false })
      .returns<Invoice[]>(),
  ]);

  const paid = (invoices ?? []).filter((i) => i.status === "paid");
  // Real earnings only count Live invoices; Test mode payments are shown separately.
  const total = (list: Invoice[]) => list.reduce((sum, i) => sum + BigInt(i.amount_units), BigInt(0));
  const earned = total(paid.filter((i) => !isTestnetChain(i.chain_id)));
  const earnedTest = total(paid.filter((i) => isTestnetChain(i.chain_id)));
  // Paid jobs that could get an onchain receipt but don't have one yet.
  const needsEvidence = (i: Invoice) => i.status === "paid" && !i.attestation_uid && receiptsEnabled(i.chain_id);
  const awaitingEvidence = paid.filter(needsEvidence);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {profile?.handle ? (
            <HandleEditor key={profile.handle} handle={profile.handle} />
          ) : (
            <p className="text-sm text-accent">
              <WalletName address={session.address} />
            </p>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your invoices</h1>
        </div>
        <div className="flex items-center gap-3">
          <form action={signOut}>
            <button type="submit" className="text-sm text-muted transition-colors hover:text-foreground">
              Sign out
            </button>
          </form>
          <Link
            href="/dashboard/new"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition hover:brightness-110"
          >
            New invoice
          </Link>
        </div>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-6">
        <AvatarUploader
          url={profile?.avatar_url ?? null}
          name={profile?.handle ?? session.address}
        />
        <Link
          href={`/u/${profile?.handle ?? session.address}`}
          className="rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
        >
          View public profile →
        </Link>
      </section>

      {!profile?.handle && <HandleForm />}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Invoices" value={String(invoices?.length ?? 0)} />
        <Stat label="Paid" value={String(paid.length)} />
        <Stat
          label="USDC earned"
          value={formatUsdc(earned)}
          note={earnedTest > BigInt(0) ? `+ ${formatUsdc(earnedTest)} in Test mode` : undefined}
        />
      </div>

      {awaitingEvidence.length > 0 && (
        <Link
          href={`/i/${awaitingEvidence[0].id}`}
          className="flex items-center justify-between gap-4 rounded-3xl border border-amber-500/40 bg-amber-500/5 px-6 py-4 text-sm transition-colors hover:bg-amber-500/10"
        >
          <span>
            <span className="font-medium">
              {awaitingEvidence.length} paid invoice{awaitingEvidence.length === 1 ? " is" : "s are"} waiting for
              delivery evidence.
            </span>{" "}
            <span className="text-muted">Add it to get an onchain receipt for your track record.</span>
          </span>
          <span className="shrink-0 font-medium text-amber-600 light:text-amber-700">Add evidence →</span>
        </Link>
      )}

      {invoices && invoices.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <Link
                href={`/i/${invoice.id}`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{invoice.title}</p>
                  <p className="truncate text-sm text-muted">
                    {invoice.client_name ? `${invoice.client_name} · ` : ""}
                    {formatDate(invoice.created_at)}
                  </p>
                </div>
                {isTestnetChain(invoice.chain_id) && <NetworkBadge testnet />}
                {needsEvidence(invoice) && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-600 light:text-amber-700">
                    Add evidence
                  </span>
                )}
                <StatusBadge status={invoice.status} overdue={isOverdue(invoice)} />
                <p className="w-28 text-right font-mono text-sm">{formatUsdc(invoice.amount_units)}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <p className="font-medium">No invoices yet</p>
          <p className="mt-1 text-sm text-muted">Create your first one and share the link with your client.</p>
          <Link
            href="/dashboard/new"
            className="mt-6 inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            Create an invoice
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
