-- Adds an optional profile picture for freelancers.
-- Run once in Supabase: SQL Editor -> New query -> paste this file -> Run.

alter table public.profiles add column if not exists avatar_url text;

alter table public.profiles drop constraint if exists profiles_avatar_url_check;
alter table public.profiles
  add constraint profiles_avatar_url_check check (char_length(avatar_url) <= 500);
