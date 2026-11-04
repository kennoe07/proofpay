// Registers the ProofPay receipt schema on EAS. Run once per network, from the project folder:
//   node --env-file=.env.local scripts/register-eas-schema.mjs base-sepolia
//   node --env-file=.env.local scripts/register-eas-schema.mjs base
// Uses ATTESTER_PRIVATE_KEY, which needs a little ETH on that network. Safe to re-run.
import { createPublicClient, createWalletClient, encodePacked, http, keccak256, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

// Must match RECEIPT_SCHEMA and RECEIPT_REVOCABLE in src/lib/eas-schema.ts.
const SCHEMA =
  "string invoiceUrl,uint256 amount,address token,address payer,bytes32 paymentTx,bytes32 deliverableHash,string deliverableUrl";
const REVOCABLE = true;
const REGISTRY = "0x4200000000000000000000000000000000000020";

const registryAbi = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [
      { name: "schema", type: "string" },
      { name: "resolver", type: "address" },
      { name: "revocable", type: "bool" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "getSchema",
    stateMutability: "view",
    inputs: [{ name: "uid", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "uid", type: "bytes32" },
          { name: "resolver", type: "address" },
          { name: "revocable", type: "bool" },
          { name: "schema", type: "string" },
        ],
      },
    ],
  },
];

const networks = {
  "base-sepolia": { chain: baseSepolia, rpc: "https://sepolia.base.org" },
  base: { chain: base, rpc: "https://mainnet.base.org" },
};
const network = networks[process.argv[2]];
if (!network) {
  console.error("Usage: node --env-file=.env.local scripts/register-eas-schema.mjs <base-sepolia|base>");
  process.exit(1);
}
const key = process.env.ATTESTER_PRIVATE_KEY;
if (!key) {
  console.error("ATTESTER_PRIVATE_KEY is missing from .env.local.");
  process.exit(1);
}

const account = privateKeyToAccount(key);
const publicClient = createPublicClient({ chain: network.chain, transport: http(network.rpc) });
const walletClient = createWalletClient({ account, chain: network.chain, transport: http(network.rpc) });
const uid = keccak256(encodePacked(["string", "address", "bool"], [SCHEMA, zeroAddress, REVOCABLE]));

console.log(`Network: ${network.chain.name}`);
console.log(`Signer:  ${account.address}`);
console.log(`Schema:  ${uid}`);

const existing = await publicClient.readContract({ address: REGISTRY, abi: registryAbi, functionName: "getSchema", args: [uid] });
if (existing.uid === uid) {
  console.log("Already registered. Nothing to do.");
  process.exit(0);
}

const balance = await publicClient.getBalance({ address: account.address });
if (balance === 0n) {
  console.error(`The signer has no ETH on ${network.chain.name}. Fund ${account.address} first.`);
  process.exit(1);
}

const hash = await walletClient.writeContract({
  address: REGISTRY,
  abi: registryAbi,
  functionName: "register",
  args: [SCHEMA, zeroAddress, REVOCABLE],
});
console.log(`Registering… tx ${hash}`);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log(receipt.status === "success" ? "Registered." : "Registration failed.");
