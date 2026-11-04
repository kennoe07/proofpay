import { createHash } from "node:crypto";
import type { Hex } from "viem";
import { attestReceipt } from "@/lib/eas";
import { receiptsEnabled } from "@/lib/eas-schema";
import { EVIDENCE_BUCKET, MAX_EVIDENCE_BYTES } from "@/lib/evidence";
import { ownedPaidInvoice } from "@/lib/invoice-access";
import { supabaseAdmin } from "@/lib/supabase-server";

// Records the delivery evidence for a paid invoice, then writes the onchain receipt (EAS),
// signed by ProofPay's own wallet.
export async function POST(request: Request, ctx: RouteContext<"/api/invoices/[id]/receipt">) {
  const { id } = await ctx.params;
  const access = await ownedPaidInvoice(id);
  if (access.error) return access.error;
  const { invoice } = access;
  if (!receiptsEnabled(invoice.chain_id)) {
    return Response.json({ error: "Onchain receipts are available in Test mode for now." }, { status: 409 });
  }

  const body = (await request.json().catch(() => null)) as { path?: unknown; link?: unknown } | null;
  const path = typeof body?.path === "string" ? body.path : "";
  const link = typeof body?.link === "string" ? body.link.trim() : "";
  const db = supabaseAdmin();

  let evidenceUrl: string;
  let evidenceHash: Hex | null = null;

  if (path) {
    // The file must belong to this invoice; fingerprint exactly what was stored.
    if (!path.startsWith(`${id}/`) || path.includes("..")) return Response.json({ error: "That file isn't for this invoice." }, { status: 400 });
    const { data: file, error } = await db.storage.from(EVIDENCE_BUCKET).download(path);
    if (error || !file) return Response.json({ error: "Couldn't find the uploaded file." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > MAX_EVIDENCE_BYTES) return Response.json({ error: "Files can be up to 10 MB." }, { status: 400 });
    evidenceHash = `0x${createHash("sha256").update(bytes).digest("hex")}`;
    evidenceUrl = db.storage.from(EVIDENCE_BUCKET).getPublicUrl(path).data.publicUrl;
  } else if (link) {
    let parsed: URL;
    try {
      parsed = new URL(link);
    } catch {
      return Response.json({ error: "That link isn't valid." }, { status: 400 });
    }
    if (parsed.protocol !== "https:" || link.length > 500) {
      return Response.json({ error: "Use an https:// link of up to 500 characters." }, { status: 400 });
    }
    evidenceUrl = parsed.toString();
  } else {
    return Response.json({ error: "Add a file or a link as evidence." }, { status: 400 });
  }

  const { error: saveError } = await db
    .from("invoices")
    .update({ evidence_url: evidenceUrl, evidence_hash: evidenceHash })
    .eq("id", id)
    .is("attestation_uid", null);
  if (saveError) return Response.json({ error: "Couldn't save the evidence." }, { status: 500 });

  let uid: Hex;
  try {
    uid = await attestReceipt({
      invoice,
      // Receipts are permanent, so point at the public site even when created from localhost.
      invoiceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin}/i/${id}`,
      deliverableHash: evidenceHash,
      deliverableUrl: evidenceUrl,
    });
  } catch (e) {
    console.error("attestReceipt failed", e);
    return Response.json(
      { error: "Evidence saved, but the onchain receipt couldn't be written. Try again in a moment." },
      { status: 502 },
    );
  }

  const { error: uidError } = await db.from("invoices").update({ attestation_uid: uid }).eq("id", id);
  if (uidError) {
    console.error("saving attestation uid failed", uid, uidError);
    return Response.json({ error: "The receipt was written but couldn't be saved. Contact support." }, { status: 500 });
  }
  return Response.json({ ok: true, uid });
}
