"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { Chain } from "viem";
import { createConfig, fallback, http, WagmiProvider } from "wagmi";
import { baseAccount, injected } from "wagmi/connectors";
import { cdpRpcUrl, chain, publicRpcUrl, supportedChains } from "@/lib/chain";

const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || undefined;

// Both networks (Test and Live), with the default one first.
const chains = [chain, ...supportedChains.filter((c) => c.id !== chain.id)] as [Chain, ...Chain[]];

// Try Coinbase's endpoint first when there's a key, then Base's public one, so the
// app keeps working on networks that can't reach Coinbase.
const transport = (chainId: number) =>
  fallback([...(apiKey ? [http(cdpRpcUrl(apiKey, chainId))] : []), http(publicRpcUrl(chainId))]);

const wagmiConfig = createConfig({
  chains,
  connectors: [baseAccount({ appName: "ProofPay" }), injected()],
  transports: Object.fromEntries(chains.map((c) => [c.id, transport(c.id)])),
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
