import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/avatar";
import { CopyLink } from "@/components/copy-link";
import { NetworkBadge } from "@/components/status-badge";
import { isTestnetChain } from "@/lib/chain";
import { easscanUrl } from "@/lib/eas-schema";
import { formatDate, formatUsdc, shortAddress } from "@/lib/format";
import { supabaseAdmin, type Invoice, type Profile } from "@/lib/supabase-server";

const HANDLE = /^[a-z0-9_]{3,24}$/;
const ADDRESS = /^0x[0-9a-f]{40}$/;

// A track record can be looked up by handle (/u/ada) or by wallet (/u/0x…).
async function loadProfile(param: string) {
  const key = decodeURIComponent(param).toLowerCase().replace(/^@/, "");
  const column = ADDRESS.test(key) ? "wallet_address" : HANDLE.test(key) ? "handle" : null;
  if (!column) return null;

  const db = supabaseAdmin();
  const { data: profile } = await db.from("profiles").select("*").eq(column, key).maybeSingle<Profile>();
  if (!profile) return null;

  // Only paid jobs make up the track record. Client names stay off this public list.
  const { data: jobs } = await db
    .from("invoices")
    .select("id, chain_id, title, amount_units, paid_at, attestation_uid, status")
    .eq("freelancer_address", profile.wallet_address)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .returns<Pick<Invoice, "id" | "chain_id" | "title" | "amount_units" | "paid_at" | "attestation_uid" | "status">[]>();

  return { profile, jobs: jobs ?? [] };
}

function displayName(profile: Profile) {
  return profile.handle ? `@${profile.handle}` : shortAddress(profile.wallet_address);
}

export async function generateMetadata(props: PageProps<"/u/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const found = await loadProfile(handle);
  if (!found) return { title: "Profile not found · ProofPay" };
  const name = displayName(found.profile);
  return {
    title: `${name} · Track record · ProofPay`,
    description: `${name}'s verified work history: ${found.jobs.length} paid job${found.jobs.length === 1 ? "" : "s"}, checked on Base.`,
  };
}

// The handle comes from the request, so the profile streams in behind Suspense.
export default function ProfilePage(props: PageProps<"/u/[handle]">) {
  return (
    <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-3xl bg-surface-2" aria-busy />}>
      <TrackRecord params={props.params} />
    </Suspense>
  );
}

async function TrackRecord({ params }: Pick<PageProps<"/u/[handle]">, "params">) {
  const { handle } = await params;
  const found = await loadProfile(handle);
  if (!found) notFound();

  const { profile, jobs } = found;
  const name = displayName(profile);
  const path = `/u/${profile.handle ?? profile.wallet_address}`;

  const live = jobs.filter((j) => !isTestnetChain(j.chain_id));
  const test = jobs.filter((j) => isTestnetChain(j.chain_id));
  const total = (list: typeof jobs) => list.reduce((sum, j) => sum + BigInt(j.amount_units), BigInt(0));
  const earned = total(live);
  const earnedTest = total(test);
  const receipts = jobs.filter((j) => j.attestation_uid).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar url={profile.avatar_url} name={profile.handle ?? profile.wallet_address} className="size-16 text-xl" />
          <div className="min-w-0">
            <p className="font-mono text-xs tracking-widest text-muted">TRACK RECORD</p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">{name}</h1>
            <p className="truncate font-mono text-sm text-muted">
              {shortAddress(profile.wallet_address)} · on ProofPay since {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
        <CopyLink path={path} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat value={String(jobs.length)} label="Verified paid jobs" />
        <Stat
          value={formatUsdc(earned)}
          label="USDC earned"
          note={earnedTest > BigInt(0) ? `+ ${formatUsdc(earnedTest)} in Test mode` : undefined}
        />
        <Stat value={String(receipts)} label="Onchain receipts" />
      </section>

      <section className="rounded-3xl border border-line bg-surface">
        <div className="flex items-center justify-between gap-4 px-6 pt-6 sm:px-8">
          <h2 className="text-lg font-semibold tracking-tight">Paid work</h2>
          <p className="text-xs text-muted">Every payment here was checked on Base by ProofPay.</p>
        </div>
        {jobs.length > 0 ? (
          <ul className="mt-4 divide-y divide-line">
            {jobs.map((job) => {
              const verifyUrl = job.attestation_uid ? easscanUrl(job.chain_id, job.attestation_uid) : null;
              return (
                <li key={job.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 sm:px-8">
                  <span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/i/${job.id}`}
                      className="block truncate font-medium underline-offset-4 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <p className="text-sm text-muted">{job.paid_at ? `Paid ${formatDate(job.paid_at)}` : "Paid"}</p>
                  </div>
                  {isTestnetChain(job.chain_id) && <NetworkBadge testnet />}
                  {verifyUrl ? (
                    <a
                      href={verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent transition hover:bg-accent/25"
                    >
                      Receipt ↗
                    </a>
                  ) : (
                    <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">No receipt yet</span>
                  )}
                  <p className="w-28 text-right font-mono text-sm">{formatUsdc(job.amount_units)}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 py-14 text-center sm:px-8">
            <p className="font-medium">No paid jobs yet</p>
            <p className="mt-1 text-sm text-muted">Paid invoices will appear here once clients pay through ProofPay.</p>
          </div>
        )}
      </section>

      <section className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface-2/60 px-6 py-8 text-center">
        <p className="text-sm text-muted">Freelancing in USDC? Build a track record your next client can check.</p>
        <Link
          href="/dashboard"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition hover:brightness-110"
        >
          Start with ProofPay
        </Link>
      </section>
    </div>
  );
}

function Stat({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
