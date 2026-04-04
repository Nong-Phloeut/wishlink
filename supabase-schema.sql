-- ─────────────────────────────────────────────
--  WishLink — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────

-- 1. Wishes table
create table if not exists public.wishes (
  id          text        primary key,                    -- nanoid 8-char e.g. "aB3xKp9z"
  occasion    text        not null,                       -- 'birthday' | 'anniversary' | 'wedding' | 'newyear' | 'farewell' | 'custom'
  recipient   text        not null,
  message     text        not null,
  from_name   text,
  date        date,
  scans       integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- 2. Index for fast lookup by creation time (used in my-wishes page)
create index if not exists wishes_created_at_idx on public.wishes (created_at desc);

-- 3. Row-Level Security — enable but allow public reads (anyone with the ID can view)
alter table public.wishes enable row level security;

-- Allow anyone to read a wish by ID (needed for the public /v/[id] page)
create policy "Public can read wishes"
  on public.wishes for select
  using (true);

-- Allow anyone to insert a wish (no auth required — free to use)
create policy "Anyone can create wishes"
  on public.wishes for insert
  with check (true);

-- Allow anyone to update scan count
create policy "Anyone can update scan count"
  on public.wishes for update
  using (true);

-- Allow anyone to delete their wish (no user auth in MVP)
create policy "Anyone can delete wishes"
  on public.wishes for delete
  using (true);

-- ─────────────────────────────────────────────
--  Verify it works — run this after creating the table:
-- ─────────────────────────────────────────────
-- select * from public.wishes limit 5;
