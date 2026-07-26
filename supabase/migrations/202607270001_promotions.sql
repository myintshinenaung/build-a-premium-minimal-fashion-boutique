-- Coupon / Promotion Engine MVP

create table if not exists public.coupons (
  id text primary key,
  code text not null unique,
  name text not null default '',
  description text not null default '',
  discount_type text not null,
  discount_value integer not null default 0,
  minimum_order_mmk integer not null default 0,
  usage_limit integer,
  usage_count integer not null default 0,
  expires_at timestamptz,
  enabled boolean not null default true,
  customer_eligibility text not null default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons drop constraint if exists coupons_discount_type_check;
alter table public.coupons
  add constraint coupons_discount_type_check
  check (discount_type in ('percentage', 'fixed', 'free_shipping'));

alter table public.coupons drop constraint if exists coupons_customer_eligibility_check;
alter table public.coupons
  add constraint coupons_customer_eligibility_check
  check (customer_eligibility in ('all', 'authenticated', 'guest'));

alter table public.coupons drop constraint if exists coupons_discount_value_check;
alter table public.coupons
  add constraint coupons_discount_value_check
  check (discount_value >= 0);

alter table public.coupons drop constraint if exists coupons_minimum_order_mmk_check;
alter table public.coupons
  add constraint coupons_minimum_order_mmk_check
  check (minimum_order_mmk >= 0);

alter table public.coupons drop constraint if exists coupons_usage_count_check;
alter table public.coupons
  add constraint coupons_usage_count_check
  check (usage_count >= 0);

create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_enabled_idx on public.coupons(enabled);

alter table public.orders
  add column if not exists coupon_id text references public.coupons(id) on delete set null,
  add column if not exists coupon_code text,
  add column if not exists discount_mmk integer not null default 0,
  add column if not exists tax_mmk integer not null default 0;

alter table public.orders drop constraint if exists orders_discount_mmk_check;
alter table public.orders
  add constraint orders_discount_mmk_check
  check (discount_mmk >= 0);

alter table public.orders drop constraint if exists orders_tax_mmk_check;
alter table public.orders
  add constraint orders_tax_mmk_check
  check (tax_mmk >= 0);

alter table public.coupons enable row level security;

drop policy if exists "Authenticated manage coupons" on public.coupons;
create policy "Authenticated manage coupons"
  on public.coupons
  for all
  to authenticated
  using (true)
  with check (true);
