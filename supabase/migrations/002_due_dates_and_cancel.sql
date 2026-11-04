-- Adds optional due dates and lets freelancers cancel unpaid invoices.
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.

alter table public.invoices add column if not exists due_date date;

alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices
  add constraint invoices_status_check check (status in ('unpaid', 'paid', 'cancelled'));
