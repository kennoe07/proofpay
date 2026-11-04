import type { Chain } from "viem";
import { base, baseSepolia } from "viem/chains";

// Each invoice records its own network: Base Sepolia for Test mode, Base for Live (real USDC).
export const supportedChains = [baseSepolia, base] as const;

// NEXT_PUBLIC_CHAIN picks the default network: used for sign-in and preselected for new invoices.
export const chain = process.env.NEXT_PUBLIC_CHAIN === "base" ? base : baseSepolia;
export const isTestnet = chain.id === baseSepolia.id;

export function getChain(chainId: number): Chain | null {
  return supportedChains.find((c) => c.id === chainId) ?? null;
}

export function isTestnetChain(chainId: number) {
  return chainId === baseSepolia.id;
}

// Circle's official USDC contracts.
const USDC: Record<number, `0x${string}`> = {
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

export const USDC_DECIMALS = 6;

export function usdcAddress(chainId: number) {
  const address = USDC[chainId];
  if (!address) throw new Error(`USDC isn't configured for chain ${chainId}.`);
  return address;
}

// Base's free public endpoints. Always reachable, used as a fallback and on the server.
export function publicRpcUrl(chainId: number) {
  return chainId === base.id ? "https://mainnet.base.org" : "https://sepolia.base.org";
}

// Coinbase Developer Platform endpoint, used first when an OnchainKit key is set.
export function cdpRpcUrl(apiKey: string, chainId: number) {
  const network = chainId === base.id ? "base" : "base-sepolia";
  return `https://api.developer.coinbase.com/rpc/v1/${network}/${apiKey}`;
}

export function explorerTxUrl(chainId: number, hash: string) {
  const explorer = getChain(chainId)?.blockExplorers?.default.url ?? "https://basescan.org";
  return `${explorer}/tx/${hash}`;
}
