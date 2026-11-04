import "server-only";
import { getSession } from "@/lib/session";
import { supabaseAdmin, type Invoice } from "@/lib/supabase-server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Loads an invoice for its owner, ready for evidence and a receipt: paid and not yet attested.
export async function ownedPaidInvoice(
  id: string,
): Promise<{ invoice: Invoice; error?: never } | { invoice?: never; error: Response }> {
  const fail = (message: string, status: number) => ({ error: Response.json({ error: message }, { status }) });

  if (!UUID.test(id)) return fail("Invoice not found.", 404);
  const session = await getSession();
  if (!session) return fail("Please sign in again.", 401);

  const { data: invoice } = await supabaseAdmin().from("invoices").select("*").eq("id", id).maybeSingle<Invoice>();
  if (!invoice) return fail("Invoice not found.", 404);
  if (invoice.freelancer_address !== session.address) return fail("Only the freelancer can add evidence.", 403);
  if (invoice.status !== "paid") return fail("Evidence can be added once the invoice is paid.", 409);
  if (invoice.attestation_uid) return fail("This invoice already has a receipt.", 409);
  return { invoice };
}
