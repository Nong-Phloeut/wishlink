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


-- Run this in Supabase SQL Editor

create table payments (
  id uuid default gen_random_uuid() primary key,
  wish_id text references wishes(id),
  amount numeric not null default 1.00,
  currency text not null default 'USD',
  status text not null default 'pending', -- pending | paid | failed
  payment_method text, -- 'aba' | 'wing' | 'manual'
  transaction_ref text, -- reference from payment provider
  created_at timestamp with time zone default now(),
  paid_at timestamp with time zone
);

-- Add is_premium column to wishes
alter table wishes add column if not exists is_premium boolean default false;

-- RLS policies
create policy "Allow public insert on payments"
on payments for insert to anon with check (true);

create policy "Allow public select on payments"
on payments for select to anon using (true);

create policy "Allow public update on payments"
on payments for update to anon using (true);

alter table payments add column if not exists proof_url text;
alter table payments add column if not exists submitted_at timestamptz;





-- ─────────────────────────────────────────────
-- Coupons table
-- ─────────────────────────────────────────────
create table if not exists public.coupons (
  id           uuid        primary key default gen_random_uuid(),
  code         text        not null unique,               -- e.g. 'BETA100'
  description  text,                                      -- internal note
  max_uses     integer     default null,                  -- null = unlimited
  used_count   integer     not null default 0,
  is_active    boolean     not null default true,
  expires_at   timestamptz default null,                  -- null = never expires
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- Coupon redemptions — tracks who used what
-- ─────────────────────────────────────────────
create table if not exists public.coupon_redemptions (
  id           uuid        primary key default gen_random_uuid(),
  coupon_id    uuid        not null references public.coupons(id),
  wish_id      text        not null references public.wishes(id),
  redeemed_at  timestamptz not null default now()
);

-- One wish can only redeem one coupon
create unique index if not exists coupon_redemptions_wish_id_idx
  on public.coupon_redemptions (wish_id);

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────
alter table public.coupons             enable row level security;
alter table public.coupon_redemptions  enable row level security;

-- Anyone can read active coupons (needed to validate on frontend)
create policy "Public can read active coupons"
  on public.coupons for select
  using (is_active = true);

-- Anyone can insert a redemption
create policy "Anyone can redeem a coupon"
  on public.coupon_redemptions for insert
  with check (true);

-- Anyone can read their own redemption
create policy "Anyone can read redemptions"
  on public.coupon_redemptions for select
  using (true);

-- ─────────────────────────────────────────────
-- Seed some starter codes
-- ─────────────────────────────────────────────
insert into public.coupons (code, description, max_uses) values
  ('BETA100',   'Beta launch — 100 uses',     5),
  ('WISHFREE',  'Influencer promo — 50 uses',  5),
  ('LAUNCH50',  'Launch week — 50 uses',        5),
  ('TEAMWISH',  'Internal team — unlimited',   null);