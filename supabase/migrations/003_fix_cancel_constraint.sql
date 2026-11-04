-- Lets invoices be cancelled. The original rule required every non-unpaid invoice to have a
-- payment, which blocked the new 'cancelled' status. Now only paid invoices need one.
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.

alter table public.invoices drop constraint if exists paid_has_payment;
alter table public.invoices
  add constraint paid_has_payment check (
    status <> 'paid' or (payment_tx_hash is not null and paid_at is not null)
  );
