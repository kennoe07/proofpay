"use client";

import { PayPanel } from "@/components/pay-panel";
import { Providers } from "@/components/providers";

// The pay panel with its wallet providers. Loaded in the browser only (see pay-panel-loader.tsx).
export function PayPanelWallet(props: React.ComponentProps<typeof PayPanel>) {
  return (
    <Providers>
      <PayPanel {...props} />
    </Providers>
  );
}
