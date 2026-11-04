import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, OgPill, og } from "@/components/og-card";
import { isTestnetChain } from "@/lib/chain";
import { formatUsdc, shortAddress } from "@/lib/format";
import { supabaseAdmin, type Invoice, type Profile } from "@/lib/supabase-server";

export const alt = "A ProofPay invoice";
export const size = OG_SIZE;
export const contentType = "image/png";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin();
  const { data: invoice } = UUID.test(id)
    ? await db.from("invoices").select("*").eq("id", id).maybeSingle<Invoice>()
    : { data: null };
  const { data: profile } = invoice
    ? await db.from("profiles").select("*").eq("wallet_address", invoice.freelancer_address).maybeSingle<Profile>()
    : { data: null };

  if (!invoice) {
    return new ImageResponse(
      (
        <OgCard eyebrow="INVOICE">
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>Invoice not found</div>
        </OgCard>
      ),
      size,
    );
  }

  const from = profile?.handle ? `@${profile.handle}` : shortAddress(invoice.freelancer_address);
  const status =
    invoice.status === "paid"
      ? { label: "Paid · verified on Base", color: og.accent }
      : invoice.status === "cancelled"
        ? { label: "Cancelled", color: og.muted }
        : { label: "Unpaid", color: og.foreground };

  return new ImageResponse(
    (
      <OgCard eyebrow="INVOICE">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 30, color: og.muted }}>From {from}</div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1050 }}>
            {invoice.title.length > 60 ? `${invoice.title.slice(0, 57)}…` : invoice.title}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div style={{ fontSize: 96, fontWeight: 700 }}>{formatUsdc(invoice.amount_units)}</div>
            <div style={{ fontSize: 40, color: og.muted }}>USDC</div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <OgPill color={status.color}>{status.label}</OgPill>
            {isTestnetChain(invoice.chain_id) && <OgPill color={og.amber}>TEST</OgPill>}
            {invoice.attestation_uid && <OgPill color={og.accent}>Onchain receipt</OgPill>}
          </div>
        </div>
      </OgCard>
    ),
    size,
  );
}
