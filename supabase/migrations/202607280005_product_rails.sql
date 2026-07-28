-- Product rails for dashboard-driven homepage merchandising (Sprint 5)

create table if not exists public.product_rails (
  id text primary key,
  store_id text not null default 'daily-outfit',
  title text not null default '',
  subtitle text not null default '',
  badge_text text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'Draft' check (status in ('Published', 'Draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_rail_items (
  id text primary key,
  rail_id text not null references public.product_rails(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  unique (rail_id, product_id)
);

create index if not exists product_rails_store_id_idx on public.product_rails(store_id);
create index if not exists product_rails_status_idx on public.product_rails(status);
create index if not exists product_rails_sort_order_idx on public.product_rails(sort_order);
create index if not exists product_rails_starts_at_idx on public.product_rails(starts_at);
create index if not exists product_rails_ends_at_idx on public.product_rails(ends_at);
create index if not exists product_rail_items_rail_id_idx on public.product_rail_items(rail_id);
create index if not exists product_rail_items_sort_order_idx on public.product_rail_items(sort_order);

alter table public.product_rails enable row level security;
alter table public.product_rail_items enable row level security;

drop policy if exists "Authenticated manage product rails" on public.product_rails;
create policy "Authenticated manage product rails"
  on public.product_rails
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage product rail items" on public.product_rail_items;
create policy "Authenticated manage product rail items"
  on public.product_rail_items
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.product_rails (
  id,
  store_id,
  title,
  subtitle,
  badge_text,
  description,
  sort_order,
  status
) values
  (
    'pr-daily-trending',
    'daily-outfit',
    'Trending Now',
    'Popular picks across Daily Outfit',
    '',
    '',
    0,
    'Published'
  ),
  (
    'pr-daily-new-arrivals',
    'daily-outfit',
    'New Arrivals',
    'Fresh styles added this week',
    'New',
    '',
    1,
    'Published'
  ),
  (
    'pr-daily-best-sellers',
    'daily-outfit',
    'Best Sellers',
    'Based on what shoppers love',
    '',
    '',
    2,
    'Published'
  )
on conflict (id) do update set
  store_id = excluded.store_id,
  title = excluded.title,
  subtitle = excluded.subtitle,
  badge_text = excluded.badge_text,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

insert into public.product_rail_items (id, rail_id, product_id, sort_order) values
  ('pri-1', 'pr-daily-trending', 'prd-ivory-column', 0),
  ('pri-2', 'pr-daily-trending', 'prd-copy-7711', 1),
  ('pri-3', 'pr-daily-trending', 'prd-copy-2752', 2),
  ('pri-4', 'pr-daily-trending', 'prd-black-waistcoat', 3),
  ('pri-5', 'pr-daily-new-arrivals', 'prd-ivory-column', 0),
  ('pri-6', 'pr-daily-new-arrivals', 'prd-copy-7711', 1),
  ('pri-7', 'pr-daily-new-arrivals', 'prd-satin-blouse', 2),
  ('pri-8', 'pr-daily-best-sellers', 'prd-ivory-column', 0),
  ('pri-9', 'pr-daily-best-sellers', 'prd-black-waistcoat', 1),
  ('pri-10', 'pr-daily-best-sellers', 'prd-wide-jean', 2)
on conflict (id) do update set
  rail_id = excluded.rail_id,
  product_id = excluded.product_id,
  sort_order = excluded.sort_order;
