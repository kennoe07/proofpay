"use client";

import { type Connector, useConnect } from "wagmi";

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

export function WalletPicker({ onError }: { onError: (message: string | null) => void }) {
  const { connectors, connect, isPending } = useConnect();
  const { smart, extensions } = walletOptions(connectors);

  function connectWith(connector: Connector) {
    onError(null);
    connect(
      { connector },
      { onError: (e) => onError(/reject|denied/i.test(e.message) ? "Connection cancelled." : e.message) },
    );
  }

  return (
    <div className="space-y-6">
      {smart.map((connector) => (
        <button
          key={connector.uid}
          type="button"
          disabled={isPending}
          onClick={() => connectWith(connector)}
          className="w-full rounded-2xl border border-line bg-surface-2/60 px-5 py-4 text-left transition-colors hover:border-accent/50 disabled:opacity-60"
        >
          <span className="block font-medium">Coinbase Smart Wallet</span>
          <span className="mt-0.5 block text-sm text-muted">Use a passkey. No extension needed.</span>
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
                  disabled={isPending}
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
  );
}
