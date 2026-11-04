import "server-only";
import { createPublicClient, erc20Abi, http, parseEventLogs, type Hash } from "viem";
import { getChain, publicRpcUrl, usdcAddress } from "@/lib/chain";
import type { Invoice } from "@/lib/supabase-server";

// Base's public endpoint for the invoice's network: reachable from anywhere,
// including the builder's network.
function clientFor(chainId: number) {
  const chain = getChain(chainId);
  return chain ? createPublicClient({ chain, transport: http(publicRpcUrl(chainId)) }) : null;
}

// Allows for small clock differences between our database and Base block times.
const CLOCK_SKEW_SECONDS = 120;

export type PaymentCheck =
  | { ok: true; payer: string; paidAt: string }
  | { ok: false; status: number; error: string; pending?: boolean };

// Proves, from Base itself, that `hash` paid `invoice`. Never trusts anything the client says
// beyond the transaction hash.
export async function checkPayment(invoice: Invoice, hash: Hash): Promise<PaymentCheck> {
  const client = clientFor(invoice.chain_id);
  if (!client) {
    return { ok: false, status: 400, error: "This invoice is on a network ProofPay doesn't support." };
  }

  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash });
  } catch (e) {
    if (e instanceof Error && e.name === "TransactionReceiptNotFoundError") {
      return { ok: false, status: 409, pending: true, error: "The payment isn't confirmed yet." };
    }
    return { ok: false, status: 502, error: "Couldn't reach Base to check the payment. Try again." };
  }

  if (receipt.status !== "success") {
    return { ok: false, status: 400, error: "That transaction failed on Base, so nothing was paid." };
  }

  const freelancer = invoice.freelancer_address.toLowerCase();
  const amount = BigInt(invoice.amount_units);
  const transfer = parseEventLogs({ abi: erc20Abi, eventName: "Transfer", logs: receipt.logs }).find(
    (log) =>
      log.address.toLowerCase() === usdcAddress(invoice.chain_id).toLowerCase() &&
      log.args.to.toLowerCase() === freelancer &&
      log.args.value >= amount,
  );
  if (!transfer) {
    return {
      ok: false,
      status: 400,
      error: "That transaction doesn't send enough USDC to this invoice's wallet.",
    };
  }

  const payer = transfer.args.from.toLowerCase();
  if (payer === freelancer) {
    return { ok: false, status: 400, error: "An invoice can't be paid from the freelancer's own wallet." };
  }

  const block = await client.getBlock({ blockNumber: receipt.blockNumber });
  const createdAt = Math.floor(new Date(invoice.created_at).getTime() / 1000);
  if (Number(block.timestamp) < createdAt - CLOCK_SKEW_SECONDS) {
    return { ok: false, status: 400, error: "That payment was made before this invoice existed." };
  }

  return { ok: true, payer, paidAt: new Date(Number(block.timestamp) * 1000).toISOString() };
}
