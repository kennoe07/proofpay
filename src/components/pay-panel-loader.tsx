"use client";

import dynamic from "next/dynamic";

// Wallet libraries only run in the browser (see wallet-sign-in.tsx for why).
export const PayPanelLoader = dynamic(() => import("./pay-panel-wallet").then((m) => m.PayPanelWallet), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8" aria-busy>
      <p className="text-lg font-semibold tracking-tight">Pay this invoice</p>
      <div className="mt-6 h-12 animate-pulse rounded-full bg-surface-2" />
    </div>
  ),
});
