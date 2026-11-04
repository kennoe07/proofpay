# ProofPay

**A verifiable record of paid work.** Freelancers invoice in USDC on Base, the client pays from the invoice page,
and each paid job becomes an onchain receipt that links the delivered work to the payment. The receipts add up to a
public track record the freelancer can show their next client.

Live app: **https://proofpay-rho.vercel.app** · Built for Vibeathon 02 ("Night shift") by Vibestarter.

## Try it

- **No wallet needed:** open a [real paid invoice](https://proofpay-rho.vercel.app/i/b3aa8a7c-70ea-4c3a-b314-0add4b8dbde9)
  and click **Verify on EAS** to see its receipt on the Ethereum Attestation Service explorer. Click the freelancer's
  name to see their public track record.
- **Full flow (about 5 minutes, free):** sign in at `/dashboard`, create a **Test mode** invoice, and pay it from a
  second wallet on Base Sepolia (free test USDC at [faucet.circle.com](https://faucet.circle.com)). Watch it flip to
  Paid, attach a file as evidence, and get the onchain receipt.

## How it works

1. **Sign in** with a wallet (Sign-In With Ethereum: a signature, no transaction). Coinbase Smart Wallet and browser
   wallets are supported.
2. **Create an invoice** in Test mode (Base Sepolia) or Live (Base, real USDC), and share its link.
3. **The client pays** from the invoice page with one USDC transfer, straight to the freelancer. ProofPay never
   holds funds and has no payment contract.
4. **ProofPay checks the payment on Base itself** before marking the invoice paid
   ([`src/lib/verify-payment.ts`](src/lib/verify-payment.ts)):
   - the transaction succeeded;
   - it moved official USDC (Circle's contract for that network);
   - to the invoice's wallet, for at least the invoice amount;
   - from a different wallet than the freelancer's;
   - after the invoice was created, and the same transaction can never pay a second invoice.
5. **The freelancer attaches delivery evidence** (a file or an https link). For files, ProofPay stores the SHA-256
   fingerprint of exactly what was uploaded.
6. **ProofPay writes an EAS attestation** signed by its own wallet and addressed to the freelancer, with this schema:

   ```
   string invoiceUrl, uint256 amount, address token, address payer,
   bytes32 paymentTx, bytes32 deliverableHash, string deliverableUrl
   ```

   Anyone can verify a receipt on [easscan](https://base-sepolia.easscan.org) without trusting ProofPay's database.
7. **Every paid job appears on the freelancer's public track record** at `/u/<handle>`, with Test and Live earnings
   kept separate. Client names are not shown there.

Also included: due dates with an Overdue badge, cancelling unpaid invoices, "Paid outside ProofPay?" (verify a
transaction hash by hand), profile pictures, Basename display, link previews, and light and dark themes.

## Current limits

- Onchain receipts are on for Test mode. Live payments are verified the same way; Live receipts switch on once the
  signer wallet is funded on Base mainnet.
- An ERC-20 transfer can't carry an invoice ID. If a freelancer has two unpaid invoices for the same amount, the first
  matching claim decides which one a transfer pays.
- ProofPay proves that a wallet paid the freelancer, not who controls that wallet. Track records show payer addresses
  so readers can judge them.

## Next

Live receipts on Base mainnet, then more stablecoins (such as USDT) via a per-invoice token field.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS v4 · wagmi + viem · OnchainKit / Coinbase Smart
Wallet · Ethereum Attestation Service on Base · Supabase (Postgres with row-level security, storage) · Vercel.

## Security notes

- Sessions are HMAC-signed, httpOnly cookies; sign-in nonces are single-use.
- The database refuses all writes from the public key (row-level security). Every write goes through server routes
  that check the session and ownership.
- Payments are only marked paid after the checks above, and only while the invoice is still unpaid.
- Secrets (database secret key, session secret, attester key) live in environment variables and never reach the
  browser.

## Run it locally

Requires Node 20+.

```bash
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql), then the files in
   [`supabase/migrations/`](supabase/migrations) in order. Create public storage buckets `evidence` (10 MB) and
   `avatars` (2 MB, images only).
2. Generate a fresh wallet for `ATTESTER_PRIVATE_KEY`, give it a little Base Sepolia ETH, and register the receipt
   schema: `node --env-file=.env.local scripts/register-eas-schema.mjs base-sepolia`. Put the schema UID it prints in
   [`src/lib/eas-schema.ts`](src/lib/eas-schema.ts).

Never commit `.env.local`.

## Built with AI

ProofPay was built in one week by a builder who was new to React, Next.js and TypeScript, working with
**Claude Code (Claude Opus 5.5)**. Claude wrote and tested the code, explained each step in plain language, and
checked payment and sign-in logic against real Base Sepolia transactions, including forged signatures, reused nonces
and five ways to fake a payment. The builder made the product decisions, ran the Supabase and Vercel setup, and
tested end to end with real wallets and a second freelancer. [`CLAUDE.md`](CLAUDE.md) is the shared project notebook
used throughout.
