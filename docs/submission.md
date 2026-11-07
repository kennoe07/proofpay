# Vibeathon 02 submission: ProofPay

Draft answers for app.vibestarter.xyz/vibeathon/submit. Fields marked * are required.

## Project name *

ProofPay

## Tagline *

USDC invoices on Base that turn every paid job into an onchain receipt, so freelancers build a track record clients can verify.

## Live app URL *

https://proofpay-rho.vercel.app

## Product screenshot (optional)

Upload `docs/screenshot-landing.png` (landing page with live stats) or `docs/screenshot-receipt.png` (a Live invoice paid in real USDC on Base, with its onchain receipt). Both refreshed 7 Nov.

## Repo URL (optional)

https://github.com/kennoe07/proofpay (only if the repo is made public)

## Project X handle (optional)

Leave blank unless ProofPay gets its own X account.

## What does it do, and what should judges try? *

ProofPay is for freelancers paid in USDC. Screenshots and testimonials are easy to fake, so ProofPay links what you delivered to how you were paid, and turns each paid job into proof anyone can check.

How it works:
1. A freelancer signs in with their wallet (Sign-In With Ethereum, no transaction) and creates a USDC invoice, then shares its link.
2. The client pays from the invoice page in one USDC transfer, straight to the freelancer. ProofPay never holds funds.
3. ProofPay verifies the payment on Base itself: official USDC, right wallet, at least the amount, made after the invoice, and never reused for another invoice.
4. The freelancer attaches delivery evidence (a file or link). ProofPay records the file's SHA-256 fingerprint and writes a receipt with the Ethereum Attestation Service, signed by ProofPay's own wallet and addressed to the freelancer.
5. Every paid job lands on a public track record page, with each receipt verifiable on EAS.

Try it, quickest first:
- No wallet needed: open a real paid invoice at https://proofpay-rho.vercel.app/i/b3aa8a7c-70ea-4c3a-b314-0add4b8dbde9 and click "Verify on EAS" to see its onchain receipt. Click the freelancer's name to see their public track record.
- Full flow (about 5 minutes, free): sign in at /dashboard, create a Test mode invoice for 1 USDC, then pay it from a second wallet on Base Sepolia (free test USDC at faucet.circle.com). Watch it flip to Paid, add a file as evidence, and get the onchain receipt.

Each invoice can be Test mode (Base Sepolia, free test USDC) or Live (Base mainnet, real USDC). Both get the same payment checks and onchain receipts. Real money, already working: https://proofpay-rho.vercel.app/i/4416f732-aa89-4129-a358-025ad2747f64 is a Live invoice paid in real USDC on Base mainnet, with its receipt on base.easscan.org.

What early users said:
- "I love how it solves the problem of easy payment from the client to the clientele, you don't have to bother about over payment or under payment of any kind plus it's easy to use and fast also." (@chrome, ProofPay user)
- "brooo, how did you manage to think of this solution, and built??" (@kingdara07, who tested the full flow with me: he invoiced, I paid, and the receipt went onchain)
- "Really impressed with how straightforward ProofPay makes USDC invoicing. Direct wallet payments, verifiable receipts, and a public work history all in one place. Super useful for freelancers!" (Favour)

What's next: one-invoice-per-payment matching, paid notifications, client confirmation of delivery, and more stablecoins. Roadmap: https://github.com/kennoe07/proofpay/blob/main/docs/roadmap.md

Built during Vibeathon 02: ProofPay is a new product, started from an empty project after applications closed. Everything in the live app was built during build week: wallet sign-in, invoices (Test and Live), in-page USDC payment with onchain verification, delivery evidence, EAS receipts, public track records, Basenames and link previews. The first commit is from 3 Nov 2026 and the full history is in the repo.

## Built with *

Claude Code (Claude Opus 5.5) wrote and tested the app with me, from planning to deploy. Stack: Next.js 16, TypeScript, Tailwind, wagmi/viem, OnchainKit (Coinbase Smart Wallet), Ethereum Attestation Service on Base, Supabase, Vercel.

Tool chips to pick: Claude Code, Claude.

## Demo video URL (optional)

Record from `docs/demo-script.md`, then paste the Loom or YouTube link.

## Fundable result link (optional)

Score the live app at fundable.vibestarter.xyz and paste the result link.
