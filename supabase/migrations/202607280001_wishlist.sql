-- Wishlist MVP

create table if not exists public.wishlist (
  id text primary key,
  account_id text not null references public.customer_accounts(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists wishlist_account_product_uidx on public.wishlist(account_id, product_id);
create index if not exists wishlist_account_id_idx on public.wishlist(account_id);

alter table public.wishlist enable row level security;

drop policy if exists "Authenticated manage wishlist" on public.wishlist;
create policy "Authenticated manage wishlist"
  on public.wishlist
  for all
  to authenticated
  using (true)
  with check (true);
