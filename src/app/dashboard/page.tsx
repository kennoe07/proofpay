import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HandleForm } from "@/components/handle-form";
import { WalletSignIn } from "@/components/wallet-sign-in";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatUsdc, shortAddress } from "@/lib/format";
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
  const earned = paid.reduce((sum, i) => sum + BigInt(i.amount_units), BigInt(0));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-accent">
            {profile?.handle ? `@${profile.handle}` : shortAddress(session.address)}
          </p>
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

      {!profile?.handle && <HandleForm />}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Invoices" value={String(invoices?.length ?? 0)} />
        <Stat label="Paid" value={String(paid.length)} />
        <Stat label="USDC earned" value={formatUsdc(earned)} />
      </div>

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
                <StatusBadge status={invoice.status} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
