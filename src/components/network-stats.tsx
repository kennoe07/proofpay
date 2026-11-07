import { cacheLife } from "next/cache";
import { isTestnetChain } from "@/lib/chain";
import { formatUsdc } from "@/lib/format";
import { supabaseAdmin, type Invoice } from "@/lib/supabase-server";

type PaidRow = Pick<Invoice, "freelancer_address" | "chain_id" | "amount_units" | "attestation_uid">;

// Real activity across all of ProofPay, straight from the database. Cached and refreshed
// every few minutes. Renders nothing if it can't load, so the landing page never breaks.
export async function NetworkStats() {
  "use cache";
  cacheLife("minutes");

  const { data, error } = await supabaseAdmin()
    .from("invoices")
    .select("freelancer_address, chain_id, amount_units, attestation_uid")
    .eq("status", "paid")
    .returns<PaidRow[]>();
  if (error || !data) return null;

  const sum = (rows: PaidRow[]) => rows.reduce((total, r) => total + BigInt(r.amount_units), BigInt(0));
  const live = sum(data.filter((r) => !isTestnetChain(r.chain_id)));
  const test = sum(data.filter((r) => isTestnetChain(r.chain_id)));

  const stats = [
    { value: String(data.length), label: "Payments verified on Base" },
    { value: String(new Set(data.map((r) => r.freelancer_address)).size), label: "Freelancers paid" },
    { value: String(data.filter((r) => r.attestation_uid).length), label: "Onchain receipts" },
    {
      value: formatUsdc(live + test),
      label: "USDC paid through ProofPay",
      note: `${formatUsdc(live)} Live · ${formatUsdc(test)} in Test mode`,
    },
  ];

  return (
    <section aria-labelledby="network-stats" className="pt-4">
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="network-stats" className="text-sm font-medium">
            ProofPay so far
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-2.5 py-0.5 text-xs text-accent">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Real numbers, updated every few minutes
          </span>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-line bg-surface-2/60 p-4">
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</dd>
              {stat.note && <dd className="mt-1 text-xs text-muted">{stat.note}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
