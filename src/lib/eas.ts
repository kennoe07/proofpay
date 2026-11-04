import "server-only";
import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  http,
  parseAbiParameters,
  parseEventLogs,
  zeroHash,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getChain, publicRpcUrl, usdcAddress } from "@/lib/chain";
import { EAS_ADDRESS, RECEIPT_REVOCABLE, RECEIPT_SCHEMA, RECEIPT_SCHEMA_UID } from "@/lib/eas-schema";
import type { Invoice } from "@/lib/supabase-server";

const easAbi = [
  {
    type: "function",
    name: "attest",
    stateMutability: "payable",
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "schema", type: "bytes32" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "recipient", type: "address" },
              { name: "expirationTime", type: "uint64" },
              { name: "revocable", type: "bool" },
              { name: "refUID", type: "bytes32" },
              { name: "data", type: "bytes" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "event",
    name: "Attested",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "attester", type: "address", indexed: true },
      { name: "uid", type: "bytes32", indexed: false },
      { name: "schemaUID", type: "bytes32", indexed: true },
    ],
  },
] as const;

function attester() {
  const key = process.env.ATTESTER_PRIVATE_KEY;
  if (!key || !/^0x[0-9a-fA-F]{64}$/.test(key)) throw new Error("ATTESTER_PRIVATE_KEY is missing or invalid.");
  return privateKeyToAccount(key as Hex);
}

export function attesterAddress() {
  return attester().address;
}

type ReceiptInput = {
  invoice: Invoice;
  invoiceUrl: string;
  deliverableHash: Hex | null;
  deliverableUrl: string;
};

// Writes a ProofPay receipt for a paid invoice on its own network and returns the attestation uid.
export async function attestReceipt({ invoice, invoiceUrl, deliverableHash, deliverableUrl }: ReceiptInput) {
  const chain = getChain(invoice.chain_id);
  if (!chain) throw new Error("Unsupported network.");
  if (invoice.status !== "paid" || !invoice.payment_tx_hash || !invoice.payer_address) {
    throw new Error("Only paid invoices get a receipt.");
  }

  const account = attester();
  const transport = http(publicRpcUrl(chain.id));
  const publicClient = createPublicClient({ chain, transport });
  const walletClient = createWalletClient({ account, chain, transport });

  const data = encodeAbiParameters(parseAbiParameters(RECEIPT_SCHEMA), [
    invoiceUrl,
    BigInt(invoice.amount_units),
    usdcAddress(chain.id),
    invoice.payer_address as Hex,
    invoice.payment_tx_hash as Hex,
    deliverableHash ?? zeroHash,
    deliverableUrl,
  ]);

  const hash = await walletClient.writeContract({
    address: EAS_ADDRESS,
    abi: easAbi,
    functionName: "attest",
    args: [
      {
        schema: RECEIPT_SCHEMA_UID,
        data: {
          recipient: invoice.freelancer_address as Hex,
          expirationTime: BigInt(0),
          revocable: RECEIPT_REVOCABLE,
          refUID: zeroHash,
          data,
          value: BigInt(0),
        },
      },
    ],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("The receipt transaction failed on Base.");
  const [event] = parseEventLogs({ abi: easAbi, eventName: "Attested", logs: receipt.logs });
  if (!event) throw new Error("The receipt was sent but EAS didn't confirm it.");
  return event.args.uid;
}
