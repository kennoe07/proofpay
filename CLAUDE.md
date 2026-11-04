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
· Supabase (Postgres + storage for evidence files) · EAS SDK · Sign-In With Ethereum · Vercel hosting.
This Next.js version differs from older training data: read `node_modules/next/dist/docs/` before using an API.

## Status (Wed 4 Nov 2026)

- Done: scaffolded app, landing page (`src/app/page.tsx`), title in `src/app/layout.tsx`. Lint and build pass.
  First commit `823f52f` on `main`. Git identity set for this repo only (name "kenno").
- Pushed to private repo https://github.com/kennoe07/proofpay (`origin`, branch `main`).
- Builder has Vercel and Supabase accounts (signed up with GitHub). No Supabase project created yet.
- Live on Vercel at https://proofpay-rho.vercel.app (auto-deploys on push to `main`).
- Landing page redesigned (dark default, light/dark toggle in `src/components/theme-toggle.tsx`).
- Installed but not yet wired up: `@coinbase/onchainkit`, `wagmi`, `viem`, `@tanstack/react-query`, `@supabase/supabase-js`.
- Next: wallet sign-in and invoice creation. Builder is asking on Discord whether a testnet entry is acceptable.

## Plan

| Day | Goal |
|---|---|
| Wed 4 | Push to GitHub, deploy on Vercel (live URL), wallet sign-in, create invoice |
| Thu 5 | Public invoice page, pay flow, server-side payment check |
| Fri 6 | Evidence upload, receipt page, EAS attestation |
| Sat 7 | Profile page, mobile polish, empty and error states |
| Sun 8 | Test with 3–5 freelancers, record demo, **submit** |
| Mon 9 | Buffer only; edit the entry, no new features |
