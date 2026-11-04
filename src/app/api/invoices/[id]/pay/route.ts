import type { Hash } from "viem";
import { supabaseAdmin, type Invoice } from "@/lib/supabase-server";
import { checkPayment } from "@/lib/verify-payment";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TX_HASH = /^0x[0-9a-f]{64}$/i;

// Public on purpose: anyone may submit a transaction hash, because the claim is checked
// against Base itself. A hash can only ever mark one invoice as paid.
export async function POST(request: Request, ctx: RouteContext<"/api/invoices/[id]/pay">) {
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => null)) as { txHash?: unknown } | null;
  const txHash = typeof body?.txHash === "string" ? body.txHash.trim().toLowerCase() : "";

  if (!UUID.test(id)) return Response.json({ error: "Invoice not found." }, { status: 404 });
  if (!TX_HASH.test(txHash)) {
    return Response.json({ error: "That doesn't look like a transaction hash." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: invoice } = await db.from("invoices").select("*").eq("id", id).maybeSingle<Invoice>();
  if (!invoice) return Response.json({ error: "Invoice not found." }, { status: 404 });

  if (invoice.status === "paid") {
    return invoice.payment_tx_hash === txHash
      ? Response.json({ ok: true })
      : Response.json({ error: "This invoice is already paid." }, { status: 409 });
  }

  const check = await checkPayment(invoice, txHash as Hash);
  if (!check.ok) {
    return Response.json({ error: check.error, pending: check.pending ?? false }, { status: check.status });
  }

  // Only flips an invoice that is still unpaid, so two claims can't both win.
  const { data: updated, error } = await db
    .from("invoices")
    .update({ status: "paid", payment_tx_hash: txHash, payer_address: check.payer, paid_at: check.paidAt })
    .eq("id", id)
    .eq("status", "unpaid")
    .select("id");

  if (error) {
    const reused = error.code === "23505";
    return Response.json(
      { error: reused ? "That transaction has already paid another invoice." : "Couldn't save the payment." },
      { status: reused ? 409 : 500 },
    );
  }
  if (!updated?.length) return Response.json({ error: "This invoice is already paid." }, { status: 409 });

  return Response.json({ ok: true });
}
