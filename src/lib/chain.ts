import { base, baseSepolia } from "viem/chains";

// NEXT_PUBLIC_CHAIN picks the network. Base Sepolia (testnet) is the default.
export const chain = process.env.NEXT_PUBLIC_CHAIN === "base" ? base : baseSepolia;

export const isTestnet = chain.id === baseSepolia.id;

// Circle's official USDC contracts.
export const USDC_ADDRESS =
  chain.id === base.id
    ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export const USDC_DECIMALS = 6;

// Base's free public endpoint. Always reachable, used as a fallback and on the server.
export const publicRpcUrl = chain.id === base.id ? "https://mainnet.base.org" : "https://sepolia.base.org";

// Coinbase Developer Platform endpoint, used first when an OnchainKit key is set.
export function cdpRpcUrl(apiKey: string) {
  const network = chain.id === base.id ? "base" : "base-sepolia";
  return `https://api.developer.coinbase.com/rpc/v1/${network}/${apiKey}`;
}

export function explorerTxUrl(hash: string) {
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}
