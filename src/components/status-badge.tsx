import type { Invoice } from "@/lib/supabase-server";

export function StatusBadge({ status }: { status: Invoice["status"] }) {
  return status === "paid" ? (
    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">Paid</span>
  ) : (
    <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">Unpaid</span>
  );
}
