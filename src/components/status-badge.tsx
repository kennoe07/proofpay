import type { Invoice } from "@/lib/supabase-server";

export function StatusBadge({ status, overdue = false }: { status: Invoice["status"]; overdue?: boolean }) {
  if (status === "paid") {
    return <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">Paid</span>;
  }
  if (status === "cancelled") {
    return <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted line-through">Cancelled</span>;
  }
  if (overdue) {
    return <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">Overdue</span>;
  }
  return <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">Unpaid</span>;
}

// Test-mode invoices use Base Sepolia, so they never move real money.
export function NetworkBadge({ testnet }: { testnet: boolean }) {
  return testnet ? (
    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide text-amber-600 light:text-amber-700">
      TEST
    </span>
  ) : (
    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">Live</span>
  );
}
