import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, og } from "@/components/og-card";
import { formatUsdc } from "@/lib/format";
import { displayName, getTrackRecord, trackRecordStats } from "@/lib/track-record";

export const alt = "A ProofPay track record";
export const size = OG_SIZE;
export const contentType = "image/png";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "24px 32px",
        borderRadius: 28,
        border: `2px solid ${og.line}`,
        background: og.surface,
        minWidth: 300,
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 26, color: og.muted }}>{label}</div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const found = await getTrackRecord(handle);

  if (!found) {
    return new ImageResponse(
      (
        <OgCard eyebrow="TRACK RECORD">
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>Profile not found</div>
        </OgCard>
      ),
      size,
    );
  }

  const { earned, earnedTest, receipts } = trackRecordStats(found.jobs);
  return new ImageResponse(
    (
      <OgCard eyebrow="TRACK RECORD">
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700 }}>{displayName(found.profile)}</div>
          <div style={{ display: "flex", gap: 24 }}>
            <Stat value={String(found.jobs.length)} label="Verified paid jobs" />
            <Stat
              value={formatUsdc(earned)}
              label={earnedTest > BigInt(0) ? `USDC earned (+${formatUsdc(earnedTest)} test)` : "USDC earned"}
            />
            <Stat value={String(receipts)} label="Onchain receipts" />
          </div>
        </div>
      </OgCard>
    ),
    size,
  );
}
