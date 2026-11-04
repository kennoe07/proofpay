// Shared frame for link-preview images (Open Graph), rendered by next/og. It only supports
// inline styles and flexbox, so this mirrors the site's dark theme by hand.
export const OG_SIZE = { width: 1200, height: 630 };

export const og = {
  background: "#07090f",
  surface: "#0d111a",
  line: "#1f2838",
  foreground: "#e8ecf3",
  muted: "#8b95a8",
  accent: "#34d399",
  accentInk: "#04261a",
  amber: "#f59e0b",
};

export function OgMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill={og.accent}
        d="M6 2.5h12A1.5 1.5 0 0 1 19.5 4v17l-2.5-1.6-2.5 1.6-2.5-1.6-2.5 1.6L7 19.4 4.5 21V4A1.5 1.5 0 0 1 6 2.5Z"
      />
      <path
        d="m8.5 11 2.5 2.5L15.5 9"
        fill="none"
        stroke={og.accentInk}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OgPill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "8px 22px",
        borderRadius: 999,
        border: `2px solid ${color}`,
        color,
        fontSize: 26,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

export function OgCard({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: `radial-gradient(900px circle at 85% 0%, rgba(52,211,153,0.18), ${og.background} 60%)`,
        color: og.foreground,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <OgMark />
          <div style={{ fontSize: 36, fontWeight: 700 }}>ProofPay</div>
        </div>
        <div style={{ fontSize: 24, letterSpacing: 4, color: og.muted }}>{eyebrow}</div>
      </div>
      {children}
      <div style={{ display: "flex", fontSize: 24, color: og.muted }}>
        USDC invoices with onchain receipts, on Base
      </div>
    </div>
  );
}
