-- Enable row level security for admin-managed tables.
-- Safe to re-run: policies are dropped before recreate.

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.banners enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;

drop policy if exists "Public read published products" on public.products;
create policy "Public read published products"
  on public.products
  for select
  to anon, authenticated
  using (status = 'Published');

drop policy if exists "Public read published categories" on public.categories;
create policy "Public read published categories"
  on public.categories
  for select
  to anon, authenticated
  using (status = 'Published');

drop policy if exists "Authenticated manage products" on public.products;
create policy "Authenticated manage products"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage categories" on public.categories;
create policy "Authenticated manage categories"
  on public.categories
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage banners" on public.banners;
create policy "Authenticated manage banners"
  on public.banners
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage settings" on public.settings;
create policy "Authenticated manage settings"
  on public.settings
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage orders" on public.orders;
create policy "Authenticated manage orders"
  on public.orders
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage customers" on public.customers;
create policy "Authenticated manage customers"
  on public.customers
  for all
  to authenticated
  using (true)
  with check (true);
