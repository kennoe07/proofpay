"use client";

import { Providers } from "@/components/providers";
import { SignInCard } from "@/components/sign-in-card";

// The sign-in card with its wallet providers. Loaded in the browser only (see wallet-sign-in.tsx).
export function SignInWallet() {
  return (
    <Providers>
      <SignInCard />
    </Providers>
  );
}
