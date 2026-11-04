"use client";

import dynamic from "next/dynamic";

// Wallet libraries only run in the browser. Rendering them on the server pulls in the
// Base Account SDK's Node build, which depends on optional packages we don't use.
const SignInWallet = dynamic(() => import("./sign-in-wallet").then((m) => m.SignInWallet), {
  ssr: false,
  loading: () => (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-line bg-surface p-8" aria-busy>
      <p className="text-sm font-medium text-accent">Sign in</p>
      <div className="mt-4 h-7 w-2/3 animate-pulse rounded-lg bg-surface-2" />
      <div className="mt-8 h-16 animate-pulse rounded-2xl bg-surface-2" />
      <div className="mt-3 h-16 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  ),
});

export function WalletSignIn() {
  return <SignInWallet />;
}
