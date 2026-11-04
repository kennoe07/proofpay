"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSiweMessage } from "viem/siwe";
import { type Connector, useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { chain, isTestnet } from "@/lib/chain";
import { shortAddress } from "@/lib/format";

// Installed extensions announce themselves (EIP-6963) and get their own connector, with an
// id like "io.metamask". The generic "injected" connector is only a fallback for wallets
// that don't, so show it only when nothing announced itself.
function walletOptions(connectors: readonly Connector[]) {
  const smart = connectors.filter((c) => c.type === "baseAccount");
  const announced = connectors
    .filter((c) => c.type === "injected" && c.id !== "injected")
    .sort((a, b) => a.name.localeCompare(b.name));
  const fallback = announced.length === 0 ? connectors.filter((c) => c.id === "injected") : [];
  return { smart, extensions: [...announced, ...fallback] };
}

export function SignInCard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: connecting } = useConnect();
  const { smart, extensions } = walletOptions(connectors);
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function connectWith(connector: Connector) {
    setError(null);
    connect(
      { connector },
      { onError: (e) => setError(/reject|denied/i.test(e.message) ? "Connection cancelled." : e.message) },
    );
  }

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
        <div className="mt-8 space-y-6">
          {smart.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              disabled={connecting}
              onClick={() => connectWith(connector)}
              className="w-full rounded-2xl border border-line bg-surface-2/60 px-5 py-4 text-left transition-colors hover:border-accent/50 disabled:opacity-60"
            >
              <span className="block font-medium">Coinbase Smart Wallet</span>
              <span className="mt-0.5 block text-sm text-muted">Sign in with a passkey. No extension needed.</span>
            </button>
          ))}

          {extensions.length > 0 && (
            <div>
              <p className="mb-3 text-xs text-muted">Or use a wallet extension</p>
              <ul className="grid grid-cols-2 gap-2">
                {extensions.map((connector) => (
                  <li key={connector.uid}>
                    <button
                      type="button"
                      disabled={connecting}
                      onClick={() => connectWith(connector)}
                      className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-2.5 text-left text-sm transition-colors hover:border-accent/50 disabled:opacity-60"
                    >
                      {connector.icon ? (
                        // Wallet icons are data URIs supplied by the extension itself.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={connector.icon} alt="" className="size-6 shrink-0 rounded-md" />
                      ) : (
                        <span className="size-6 shrink-0 rounded-md bg-surface" aria-hidden />
                      )}
                      <span className="truncate font-medium">
                        {connector.id === "injected" ? "Browser wallet" : connector.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
