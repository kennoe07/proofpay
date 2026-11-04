@AGENTS.md

# ProofPay

ProofPay is the builder's entry to **Vibeathon 02 ("Night shift")**, Vibestarter's build competition.
Pitch: **a verifiable record of paid work.** A freelancer invoices in USDC on Base, the client pays,
and each paid job becomes a receipt, attested onchain, that links the deliverable to the payment.
The receipts add up to a public track record the freelancer can show the next client.

## Working with the builder

- New to React, Next.js and TypeScript. Has written GenLayer intelligent contracts in Python with AI help.
  Claude writes the code; explain each step in plain language and say what the builder needs to do by hand.
- Signs in to services themselves. Never ask them to paste private keys, seed phrases, passwords or
  API secrets into chat. Secrets go in `.env.local` (gitignored), which they edit themselves.
- **Ask before removing anything** (packages, files, features, planned tools), even when a workaround seems
  obvious. Explain the problem and the options, and let the builder decide.
- Slow internet: `npm install` of the scaffold took ~7 minutes. Batch dependency installs.
- Windows 10, VS Code, Node 24, npm 11, Git 2.55. No GitHub CLI (`gh`) installed.

## Competition facts (deadlines are 22:00 UTC = 23:00 Lagos time)

- Build week ends **Mon 9 Nov 2026**. Submit at app.vibestarter.xyz/vibeathon/submit with the wallet used to apply.
- Required: project name, one-line tagline, live URL to a working app, what it does and what to try,
  AI tools used. Optional: repo, demo video, screenshot, X handle, Fundable score link. Editable until the deadline.
- Scoring /100: Execution 30, Launch potential 25, Originality 20, Craft & UX 15, Vibecoding leverage 10.
- Judges: Ross (Vibestarter), three featured judges incl. Saumya Saxena (Base), Claude and GPT, plus the
  $VIBES holder vote as one scorecard. Judging and vote run to Mon 16 Nov.
- The sponsored Claude seat is for this project and may be revoked if nothing is submitted.
- Rules: blog.vibestarter.xyz/vibeathon-02 · Discord: discord.gg/Kfpj89bu82 · Seat help: ross@vibestarter.xyz

## Product decisions

- **Payments start from the invoice page**: the client connects a wallet and sends one USDC transfer, so the
  app knows which invoice it is for. The server then checks the transaction receipt on Base (USDC contract,
  correct recipient, correct amount) before marking it paid. Fallback: freelancer pastes a tx hash, checked the same way.
- **Receipts are EAS attestations on Base** linking invoice hash, deliverable-evidence hash and payment tx hash.
  No custom payment contract.
- **Public profile page** (e.g. `/u/<name>`) listing verified paid jobs.
- **Default to Base Sepolia** with Circle faucet test USDC so judges can try it free; keep the network configurable.
  Still to confirm on Discord whether a testnet entry is acceptable.
- Out of scope: escrow, disputes, multiple chains, fiat, swaps, AI chat.
- USDC only for the Vibeathon. After it: support more stablecoins (e.g. USDT) via a per-invoice token field.
  Good material for the "path from MVP to product" part of the submission.
- Keep a short build log of how AI tools were used (for the 10% criterion and the submission form).

## Design

Dark "night shift" theme with one green accent (tokens in `src/app/globals.css`: `background`, `surface`,
`surface-2`, `line`, `foreground`, `muted`, `accent`, `accent-ink`). Layout inspired by the Folioxa Framer
template (borrow structure only, never its content or orange branding): floating pill nav, large `rounded-3xl`
cards, bento grids, small section-label pills, accent pill buttons with an arrow circle. Any sample data shown
on marketing pages must be labelled "Example". Headless Edge on Windows lays out at ~500px minimum, so check
phone layouts at 500px width.

## Stack

Next.js 16 (App Router, `src/` dir) + TypeScript + Tailwind v4 · OnchainKit + wagmi/viem (Coinbase Smart Wallet)
· Supabase (Postgres + storage for evidence files) · EAS · Sign-In With Ethereum · Vercel hosting.
Coinbase services (portal.cdp.coinbase.com) time out on the builder's network without a VPN; `sepolia.base.org`
works directly. Keep the app usable if OnchainKit's API calls fail.
This Next.js version differs from older training data: read `node_modules/next/dist/docs/` before using an API.

## Status (Wed 4 Nov 2026)

- Done: scaffolded app, landing page (`src/app/page.tsx`), title in `src/app/layout.tsx`. Lint and build pass.
  First commit `823f52f` on `main`. Git identity set for this repo only (name "kenno").
- Pushed to private repo https://github.com/kennoe07/proofpay (`origin`, branch `main`).
- Builder has Vercel and Supabase accounts (signed up with GitHub). No Supabase project created yet.
- Live on Vercel at https://proofpay-rho.vercel.app (auto-deploys on push to `main`).
- Landing page redesigned (dark default, light/dark toggle in `src/components/theme-toggle.tsx`).
- Supabase project `bgsswdarznmpgcdfduzr` (Frankfurt). `supabase/schema.sql` has been run: `profiles` and
  `invoices` exist, public reads work, and writes with the publishable key are refused (RLS). Keys are in `.env.local`.
- Live since Thu 5 Nov (`329a95d`): Sign-In With Ethereum (`/api/auth/nonce`, `/api/auth/verify`, signed
  httpOnly session cookie in `src/lib/session.ts`), `/dashboard` (handle setup, invoice list, stats),
  `/dashboard/new` (server action `createInvoice`), public invoice page `/i/[id]`.
  Tested with a throwaway wallet: valid sign-in works; forged signatures and reused nonces are rejected.
- Wallet code is browser-only (`src/components/wallet-sign-in.tsx`, `ssr: false`): `@base-org/account`'s Node build
  pulls in `@coinbase/cdp-sdk`, whose optional `@x402/*` peers aren't installed, which breaks SSR builds.
- Cache Components is on: anything reading cookies, params or the database must sit inside `<Suspense>`.
- Vercel has all six env vars (Production); `SUPABASE_SECRET_KEY` and `SESSION_SECRET` are type Secret.
  `SESSION_SECRET` was rotated on 5 Nov after appearing in a screenshot.
- Builder signed in with a real wallet and created an invoice locally; it works.
- OPEN ISSUE (before submission): MetaMask shows "signs of phishing or wallet-draining" on
  proofpay-rho.vercel.app. Not on the public eth-phishing-detect list (checked 5 Nov), so it's the live scanner.
  Options offered: report the false positive, and/or a custom domain. Builder chose to keep testing for now.
- Pay flow built (5 Nov, not yet pushed): `src/components/pay-panel.tsx` (connect, switch chain, balance,
  USDC `transfer`, wait for receipt, then claim), `POST /api/invoices/[id]/pay` + `src/lib/verify-payment.ts`
  (receipt success, official USDC Transfer log to the freelancer for >= amount, payer != freelancer, block time
  >= invoice created_at, tx hash unique; update only if still unpaid). Owner-only "Paid outside ProofPay?" form.
  Verified against a real Base Sepolia transfer: accept, idempotent re-claim, and 5 rejection cases.
- Known limitation: an ERC-20 transfer can't carry an invoice id, so if a freelancer has two unpaid invoices
  for the same amount, whoever claims a matching transfer first decides which one it pays.
- 5 Nov: builder paid a real 1 USDC invoice on Base Sepolia from a second wallet (0x9b92…edf8 to
  0xde27…a483); it was verified and marked paid. Fixed along the way: the pay panel read the app's chain
  (`useChainId`) instead of the wallet's (`useAccount().chainId`), so a wallet on Ethereum got no Switch button;
  payment errors now show the wallet's real message; a no-gas warning links to Base's faucet list.
- Pay flow live since `5c01d0d`.
- Live 5 Nov: per-invoice Test mode (Base Sepolia) / Live (Base) stored in `invoices.chain_id`;
  `src/lib/chain.ts` helpers take a chain id; `NEXT_PUBLIC_CHAIN` is now only the default (sign-in + preselected
  network). Dashboard "USDC earned" counts Live only, Test shown separately. Owner tools on unpaid invoices
  (Copy link, Cancel with confirm, "Paid outside ProofPay?"). Optional due dates with Overdue badge.
  Migrations 002 (due_date, 'cancelled' status) and 003 (paid_has_payment only applies to 'paid') have been run.
  Builder tested Test-mode creation and cancelling locally.
- Receipts built (5 Nov, not yet pushed; builder chose "ProofPay's own wallet signs"):
  signer wallet 0x29190FEfB849BFBf67270D469B8Ad116aC9D7293, key in `.env.local` as `ATTESTER_PRIVATE_KEY`
  (generated locally, never displayed). Schema in `src/lib/eas-schema.ts`, registered per network with
  `scripts/register-eas-schema.mjs` (not yet registered: signer has 0 ETH). Public Supabase Storage bucket
  `evidence` (10 MB limit) created via API. Flow: paid invoice → owner's `EvidenceForm` (file via signed upload
  URL, or https link) → `POST /api/invoices/[id]/receipt` (SHA-256 of stored file, save evidence, `attestReceipt`
  in `src/lib/eas.ts`, save `attestation_uid`) → `ReceiptCard` with "Verify on EAS" (base-sepolia.easscan.org).
- 5 Nov: signer funded; schema registered on Base Sepolia (uid 0x111b…c5c0). Builder created the first receipt
  locally (invoice ed159899…); read back from EAS: attester, recipient, schema, amount, token, payer, tx and file
  hash all correct. Its invoiceUrl says localhost (permanent), so receipt links now use `NEXT_PUBLIC_SITE_URL`.
- Vercel has `ATTESTER_PRIVATE_KEY` (Secret) and `NEXT_PUBLIC_SITE_URL`; receipts pushed live 5 Nov.
  For Live receipts the signer also needs ETH on Base mainnet and the schema registered there
  (`node --env-file=.env.local scripts/register-eas-schema.mjs base`).
- Track record page live 5 Nov: `/u/[handle]` (also accepts a wallet address), profile header
  with Copy link, stats (paid jobs, Live USDC earned + Test separately, receipts), paid jobs with TEST and
  "Receipt ↗" (EAS) badges. Client names deliberately hidden on this public list (builder can change that).
  Dashboard links to it ("View public profile →"). Tested by handle, by address, unknown and invalid handles.
- Live 5 Nov: own logo (receipt + check, `src/components/logo.tsx`, `src/app/icon.svg`) replacing
  the `>_` mark, which is Vibestarter's brand mark; default favicon.ico deleted. Unused `.cursor-blink` CSS kept in
  `globals.css` at the builder's request. Profile pictures: `profiles.avatar_url` (migration 004, run
  5 Nov), public `avatars` bucket (2 MB, png/jpeg/webp/gif only, created via API), `/api/profile/avatar`
  POST/PUT/DELETE, `AvatarUploader` on the dashboard, `Avatar` on the profile and invoice pages.
- Landing page (live 5 Nov): the Track record bento card is now `FeaturedTrackRecord` (real @0xknight
  data, `"use cache"` + `cacheLife("minutes")`, falls back to `TrackRecordPreview`); `FEATURED_HANDLE` in
  `src/app/page.tsx`. Track record lookups shared via `src/lib/track-record.ts`. Hero receipt stays an Example.
- Next: mobile/UX polish,
  demo video, submission. Open: MetaMask warning, testnet answer on Discord.
- Decided 5 Nov: no custom domain for now; mainnet signer funding (Live receipts) later. Until funded, receipts
  on Live invoices fail with "the onchain receipt couldn't be written". Landing "Checked, not claimed" tile lists
  the five payment checks (keep in sync with `src/lib/verify-payment.ts`).

## Plan

| Day | Goal |
|---|---|
| Wed 4 | Push to GitHub, deploy on Vercel (live URL), wallet sign-in, create invoice |
| Thu 5 | Public invoice page, pay flow, server-side payment check |
| Fri 6 | Evidence upload, receipt page, EAS attestation |
| Sat 7 | Profile page, mobile polish, empty and error states |
| Sun 8 | Test with 3–5 freelancers, record demo, **submit** |
| Mon 9 | Buffer only; edit the entry, no new features |
