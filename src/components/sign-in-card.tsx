"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSiweMessage } from "viem/siwe";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { WalletPicker } from "@/components/wallet-picker";
import { chain, isTestnet } from "@/lib/chain";
import { shortAddress } from "@/lib/format";

export function SignInCard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    if (!address) return;
    setError(null);
    setSigning(true);
    try {
      const { nonce } = await fetch("/api/auth/nonce").then((r) => r.json());
      const message = createSiweMessage({
        address,
        chainId: chain.id,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
        statement: "Sign in to ProofPay. This is free and does not send a transaction.",
      });
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Sign-in failed. Please try again.");
      router.refresh();
    } catch (e) {
      const text = e instanceof Error ? e.message : "";
      setError(/reject|denied|cancel/i.test(text) ? "You cancelled the signature." : text || "Sign-in failed.");
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-line bg-surface p-8">
      <p className="font-mono text-sm text-accent">&gt;_ sign in</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Sign in with your wallet</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Your wallet is your account. Signing in is free: you sign a message, no transaction is sent.
      </p>

      {!isConnected ? (
        <div className="mt-8">
          <WalletPicker onError={setError} />
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between rounded-2xl border border-line bg-surface-2/60 px-5 py-4">
            <div>
              <p className="text-xs text-muted">Connected</p>
              <p className="font-mono text-sm">{address && shortAddress(address)}</p>
            </div>
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Switch
            </button>
          </div>
          <button
            type="button"
            onClick={signIn}
            disabled={signing}
            className="mt-4 w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-60"
          >
            {signing ? "Check your wallet…" : "Sign in"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {isTestnet && (
        <p className="mt-6 text-xs leading-5 text-muted">
          ProofPay is running on {chain.name}, a test network. Nothing here uses real money.
        </p>
      )}
    </div>
  );
}
