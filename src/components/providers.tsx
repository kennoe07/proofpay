"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { Chain } from "viem";
import { createConfig, fallback, http, WagmiProvider } from "wagmi";
import { baseAccount, injected } from "wagmi/connectors";
import { cdpRpcUrl, chain, publicRpcUrl } from "@/lib/chain";

const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || undefined;

// Try Coinbase's endpoint first when there's a key, then Base's public one, so the
// app keeps working on networks that can't reach Coinbase.
// `chain` is Base or Base Sepolia depending on config; widen it so wagmi accepts either.
const appChain: Chain = chain;

const wagmiConfig = createConfig({
  chains: [appChain],
  connectors: [baseAccount({ appName: "ProofPay" }), injected()],
  transports: {
    [appChain.id]: fallback([...(apiKey ? [http(cdpRpcUrl(apiKey))] : []), http(publicRpcUrl)]),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={apiKey}
          chain={chain}
          analytics={false}
          config={{ appearance: { name: "ProofPay" } }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
