"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { erc20Abi, type Hash } from "viem";
import {
  useAccount,
  useBalance,
  useConfig,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { WalletPicker } from "@/components/wallet-picker";
import { chain, explorerTxUrl, isTestnet, USDC_ADDRESS } from "@/lib/chain";
import { formatUsdc, shortAddress } from "@/lib/format";

type Props = { invoiceId: string; amountUnits: string; payTo: string };

// Remembers a sent payment so the check can finish even if the tab is closed mid-way.
const pendingKey = (id: string) => `pp_pending_${id}`;

function readPending(id: string): Hash | null {
  try {
    return (localStorage.getItem(pendingKey(id)) as Hash | null) ?? null;
  } catch {
    return null;
  }
}

function writePending(id: string, hash: Hash | null) {
  try {
    if (hash) localStorage.setItem(pendingKey(id), hash);
    else localStorage.removeItem(pendingKey(id));
  } catch {
    // Storage can be unavailable (private mode); the in-page flow still works.
  }
}

const button =
  "w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-60";

export function PayPanel({ invoiceId, amountUnits, payTo }: Props) {
  const router = useRouter();
  const config = useConfig();
  const amount = BigInt(amountUnits);
  // The network the wallet is actually on. (useChainId() reports the app's configured chain,
  // which is always Base here, so it can't detect a wallet sitting on another network.)
  const { address, isConnected, chainId: walletChainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, switchChainAsync, isPending: switching } = useSwitchChain();
  const { writeContractAsync, isPending: confirmingInWallet } = useWriteContract();
  // A payment sent earlier from this browser that still needs checking (this panel only
  // renders in the browser, so localStorage is available here).
  const [hash, setHash] = useState<Hash | null>(() => readPending(invoiceId));
  const [stage, setStage] = useState<"idle" | "confirming" | "checking">("idle");
  const [error, setError] = useState<string | null>(null);

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: chain.id,
    query: { enabled: Boolean(address) },
  });

  // Every transaction needs a little ETH for the network fee, even when sending USDC.
  const { data: gas } = useBalance({ address, chainId: chain.id, query: { enabled: Boolean(address) } });

  // Ask the server to verify the payment on Base. It retries while Base catches up.
  async function claim(txHash: Hash) {
    setStage("checking");
    setError(null);
    try {
      for (let attempt = 0; attempt < 10; attempt++) {
        const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          writePending(invoiceId, null);
          router.refresh();
          return;
        }
        if (!data.pending) throw new Error(data.error ?? "Couldn't confirm the payment.");
        await new Promise((r) => setTimeout(r, 3000));
      }
      throw new Error("Base is taking a while to confirm. Try checking again in a minute.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't confirm the payment.");
    } finally {
      setStage("idle");
    }
  }

  // Send the USDC, wait for Base to include it, then have the server verify it.
  async function pay() {
    setError(null);
    let txHash: Hash;
    try {
      // Belt and braces: make sure the wallet is on the invoice's network before sending.
      if (walletChainId !== chain.id) await switchChainAsync({ chainId: chain.id });
      txHash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [payTo as `0x${string}`, amount],
        chainId: chain.id,
      });
    } catch (e) {
      const text = e instanceof Error ? e.message : "";
      // viem errors carry a one-line summary; show it so the cause is visible.
      const summary = (e as { shortMessage?: string }).shortMessage;
      setError(
        /reject|denied|cancel/i.test(text)
          ? "You cancelled the payment."
          : /insufficient funds|gas/i.test(text)
            ? `Not enough ${chain.nativeCurrency.symbol} on ${chain.name} to pay the network fee.`
            : `The payment didn't go through: ${summary ?? "the wallet returned an error."}`,
      );
      return;
    }

    writePending(invoiceId, txHash);
    setHash(txHash);
    setStage("confirming");
    try {
      const receipt = await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id });
      if (receipt.status !== "success") {
        writePending(invoiceId, null);
        setHash(null);
        setStage("idle");
        setError("The transaction failed on Base, so nothing was paid.");
        return;
      }
    } catch {
      // Couldn't watch for it from the browser; the server check below waits for Base too.
    }
    await claim(txHash);
  }

  const isOwnInvoice = address?.toLowerCase() === payTo.toLowerCase();
  const wrongChain = isConnected && walletChainId !== chain.id;
  const notEnough = balance !== undefined && balance < amount;
  const noGas = gas !== undefined && gas.value === BigInt(0);

  let body: React.ReactNode;
  if (hash) {
    body = (
      <div className="space-y-3 text-sm">
        <p className="flex items-center gap-2">
          {stage !== "idle" && <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden />}
          {stage === "confirming"
            ? "Confirming on Base…"
            : stage === "checking"
              ? "Checking the payment on Base…"
              : "A payment from this browser still needs checking."}
        </p>
        <a
          href={explorerTxUrl(hash)}
          target="_blank"
          rel="noreferrer"
          className="block font-mono text-accent underline-offset-4 hover:underline"
        >
          View transaction {shortAddress(hash)}
        </a>
        {stage === "idle" && (
          <button type="button" onClick={() => claim(hash)} className={button}>
            Check payment
          </button>
        )}
      </div>
    );
  } else if (!isConnected) {
    body = (
      <>
        <p className="mb-4 text-sm text-muted">Connect the wallet you&apos;re paying from.</p>
        <WalletPicker onError={setError} />
      </>
    );
  } else if (isOwnInvoice) {
    body = (
      <p className="text-sm text-muted">
        This invoice pays to the wallet you&apos;re connected with. Share the link with your client so they
        can pay it.
      </p>
    );
  } else if (wrongChain) {
    body = (
      <button type="button" disabled={switching} onClick={() => switchChain({ chainId: chain.id })} className={button}>
        {switching ? "Switching…" : `Switch to ${chain.name}`}
      </button>
    );
  } else {
    body = (
      <div className="space-y-3">
        <button type="button" disabled={confirmingInWallet || notEnough || noGas} onClick={pay} className={button}>
          {confirmingInWallet ? "Confirm in your wallet…" : `Pay ${formatUsdc(amount)} USDC`}
        </button>
        {noGas && (
          <p className="rounded-xl bg-surface-2 px-4 py-3 text-xs leading-5 text-muted">
            This wallet has no {gas?.symbol ?? "ETH"} on {chain.name} for the network fee. Sending USDC still
            needs a tiny amount.
            {isTestnet && (
              <>
                {" "}
                <a
                  href="https://docs.base.org/tools/network-faucets"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Get free test ETH
                </a>
              </>
            )}
          </p>
        )}
        {balance !== undefined && (
          <p className={`text-center text-xs ${notEnough ? "text-red-500" : "text-muted"}`}>
            Your balance: {formatUsdc(balance)} USDC
            {notEnough && isTestnet && (
              <>
                {" · "}
                <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="underline">
                  Get test USDC
                </a>
              </>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Pay this invoice</h2>
        {isConnected && !hash && (
          <button
            type="button"
            onClick={() => disconnect()}
            className="font-mono text-xs text-muted transition-colors hover:text-foreground"
          >
            {address && shortAddress(address)} · switch
          </button>
        )}
      </div>
      <p className="mt-1 mb-6 text-sm text-muted">
        One USDC transfer on {chain.name}, straight to the freelancer&apos;s wallet.
      </p>
      {body}
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}
    </section>
  );
}
