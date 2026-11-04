import { encodePacked, keccak256, zeroAddress } from "viem";
import { base, baseSepolia } from "viem/chains";

// The ProofPay receipt format on the Ethereum Attestation Service. Each receipt is addressed to
// the freelancer and signed by ProofPay's own wallet.
// Keep in sync with scripts/register-eas-schema.mjs, which registers it on each network.
export const RECEIPT_SCHEMA =
  "string invoiceUrl,uint256 amount,address token,address payer,bytes32 paymentTx,bytes32 deliverableHash,string deliverableUrl";
export const RECEIPT_REVOCABLE = true;

// EAS derives a schema's id from its definition, resolver and revocability.
export const RECEIPT_SCHEMA_UID = keccak256(
  encodePacked(["string", "address", "bool"], [RECEIPT_SCHEMA, zeroAddress, RECEIPT_REVOCABLE]),
);

// EAS is a predeploy on Base and Base Sepolia.
export const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";
export const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020";

// Receipts need the signer funded and the schema registered on that network. Test mode always
// has them; Live (Base mainnet) is switched on with NEXT_PUBLIC_LIVE_RECEIPTS=true once ready.
export function receiptsEnabled(chainId: number) {
  if (chainId === baseSepolia.id) return true;
  return chainId === base.id && process.env.NEXT_PUBLIC_LIVE_RECEIPTS === "true";
}

export function easscanUrl(chainId: number, uid: string) {
  const host = chainId === base.id ? "base.easscan.org" : chainId === baseSepolia.id ? "base-sepolia.easscan.org" : null;
  return host ? `https://${host}/attestation/view/${uid}` : null;
}
