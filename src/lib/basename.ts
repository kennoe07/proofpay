import "server-only";
import { cacheLife } from "next/cache";
import { createPublicClient, encodePacked, http, keccak256, namehash, type Hex } from "viem";
import { base } from "viem/chains";

// Basenames (name.base.eth) live on Base mainnet, whichever network an invoice uses.
// Same lookup as OnchainKit's getName: Base's L2 resolver, then a forward check.
const L2_RESOLVER = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";
const BASE_COIN_TYPE = ((0x80000000 | base.id) >>> 0).toString(16).toUpperCase();

const resolverAbi = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "addr",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ type: "address" }],
  },
] as const;

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org", { timeout: 5000 }) });

function reverseNode(address: string) {
  const addressNode = keccak256(address.toLowerCase().slice(2) as Hex);
  return keccak256(encodePacked(["bytes32", "bytes32"], [namehash(`${BASE_COIN_TYPE}.reverse`), addressNode]));
}

// The wallet's primary Basename, or null. Only trusted when the name points back to the same
// wallet, so nobody can show a name they don't own. Cached for hours; names rarely change.
export async function getBasename(address: string): Promise<string | null> {
  "use cache";
  cacheLife("hours");

  try {
    const name = await client.readContract({
      address: L2_RESOLVER,
      abi: resolverAbi,
      functionName: "name",
      args: [reverseNode(address)],
    });
    if (!name) return null;
    const owner = await client.readContract({
      address: L2_RESOLVER,
      abi: resolverAbi,
      functionName: "addr",
      args: [namehash(name)],
    });
    return owner.toLowerCase() === address.toLowerCase() ? name : null;
  } catch {
    // Basenames are a nice-to-have: if Base can't be reached, show the address instead.
    return null;
  }
}
