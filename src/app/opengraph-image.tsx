import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, og } from "@/components/og-card";

export const alt = "ProofPay: proof of the work, proof of the pay.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard eyebrow="ON BASE">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>Proof of the work.</div>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, color: og.accent }}>Proof of the pay.</div>
          <div style={{ marginTop: 20, fontSize: 32, color: og.muted, maxWidth: 900 }}>
            Every job you finish adds to a track record your next client can check for themselves.
          </div>
        </div>
      </OgCard>
    ),
    size,
  );
}
