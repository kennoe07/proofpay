# ProofPay roadmap

ProofPay works end to end today: USDC invoices on Base, payments checked onchain, and EAS receipts that add up to a
public track record. This is what comes after the Vibeathon, in order. It's a plan, not a promise: the first real
freelancers using ProofPay will reorder it.

## Now (built for Vibeathon 02)

- Wallet sign-in, USDC invoices in Test mode (Base Sepolia) or Live (Base)
- Payment from the invoice page, verified on Base: official USDC, right wallet, enough, after the invoice, never reused
- Delivery evidence (file fingerprint or link) and an EAS receipt signed by ProofPay
- Public track record at `/u/<handle>`, due dates, cancelling, profile pictures, Basenames
- Live receipts on Base mainnet: the first real-money receipt was written on 7 Nov 2026

## Next: making it real (first weeks)

1. **One payment, one invoice, always.** A standard USDC transfer can't say which invoice it's for, so today two
   unpaid invoices for the same amount could be confused. Giving each invoice a unique amount (for example
   100.0012 USDC) ties every payment to exactly one invoice.
2. **Paid notifications.** An email or in-app alert when a client pays, so freelancers don't have to keep checking.

## Month two: making the track record trusted

3. **Client confirmation.** After paying, the client can confirm "I received the work". Receipts backed by both
   sides are much harder to fake than evidence from the freelancer alone, including payments a freelancer sends
   to themselves from a second wallet.
4. **More stablecoins.** USDT and others through a per-invoice token field, using the same onchain checks.
5. **Shareable track record.** A link and card made for bios, LinkedIn and proposals, so the record travels to
   where freelancers find their next client.

## Later: making it a product

- Track record stats a client can filter by (jobs, total paid, repeat clients, recent activity)
- Teams and agencies with one shared track record
- An API so marketplaces and job boards can read a freelancer's verified history

## Still out of scope

Escrow, disputes, fiat payouts and swaps. ProofPay never holds funds; it records what happened.
