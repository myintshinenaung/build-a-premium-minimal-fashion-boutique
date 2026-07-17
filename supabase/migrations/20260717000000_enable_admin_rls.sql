-- Enable row level security for admin-managed tables.
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.banners enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;

-- Public storefront reads for published catalog data.
create policy "Public read published products"
  on public.products
  for select
  to anon, authenticated
  using (status = 'Published');

create policy "Public read published categories"
  on public.categories
  for select
  to anon, authenticated
  using (status = 'Published');

-- Authenticated admin users can manage all boutique data.
create policy "Authenticated manage products"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated manage categories"
  on public.categories
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated manage banners"
  on public.banners
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated manage settings"
  on public.settings
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated manage orders"
  on public.orders
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated manage customers"
  on public.customers
  for all
  to authenticated
  using (true)
  with check (true);
