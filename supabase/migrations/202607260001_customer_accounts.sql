-- Customer Accounts MVP

create table if not exists public.customer_accounts (
  id text primary key,
  user_id uuid not null unique,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  avatar_url text not null default '',
  preferred_language text not null default 'my',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_accounts drop constraint if exists customer_accounts_preferred_language_check;
alter table public.customer_accounts
  add constraint customer_accounts_preferred_language_check
  check (preferred_language in ('my', 'en'));

create table if not exists public.customer_addresses (
  id text primary key,
  account_id text not null references public.customer_accounts(id) on delete cascade,
  label text not null default '',
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  township text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_account_id_idx on public.customer_addresses(account_id);

alter table public.orders
  add column if not exists account_id text references public.customer_accounts(id) on delete set null;

create index if not exists orders_account_id_idx on public.orders(account_id);

alter table public.customer_accounts enable row level security;
alter table public.customer_addresses enable row level security;

drop policy if exists "Authenticated manage customer_accounts" on public.customer_accounts;
create policy "Authenticated manage customer_accounts"
  on public.customer_accounts
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage customer_addresses" on public.customer_addresses;
create policy "Authenticated manage customer_addresses"
  on public.customer_addresses
  for all
  to authenticated
  using (true)
  with check (true);
