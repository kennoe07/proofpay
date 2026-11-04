-- ProofPay database schema.
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.
--
-- Reads are public (invoice pages and track records are meant to be shared).
-- There are no insert/update policies: only the server, using the secret key,
-- can write, and it does so after checking the user's Sign-In With Ethereum session.

create table if not exists public.profiles (
  wallet_address text primary key check (wallet_address = lower(wallet_address)),
  handle text unique check (handle ~ '^[a-z0-9_]{3,24}$'),
  display_name text check (char_length(display_name) <= 60),
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  freelancer_address text not null references public.profiles (wallet_address),
  chain_id integer not null,
  title text not null check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 2000),
  client_name text check (char_length(client_name) <= 120),
  -- USDC has 6 decimals; store the exact base-unit amount to avoid rounding.
  amount_units bigint not null check (amount_units > 0),
  status text not null default 'unpaid' check (status in ('unpaid', 'paid')),
  created_at timestamptz not null default now(),

  -- Filled in once the payment is verified onchain.
  payment_tx_hash text unique,
  payer_address text,
  paid_at timestamptz,

  -- Filled in when the freelancer attaches delivery evidence.
  evidence_url text,
  evidence_hash text,

  -- Filled in once the receipt is attested with EAS.
  attestation_uid text unique,

  constraint paid_has_payment check (
    status = 'unpaid' or (payment_tx_hash is not null and paid_at is not null)
  )
);

create index if not exists invoices_freelancer_idx
  on public.invoices (freelancer_address, created_at desc);

alter table public.profiles enable row level security;
alter table public.invoices enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public" on public.profiles
  for select using (true);

drop policy if exists "Invoices are public" on public.invoices;
create policy "Invoices are public" on public.invoices
  for select using (true);
