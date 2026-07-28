-- Featured collections for dashboard-driven homepage merchandising (Sprint 4)

create table if not exists public.featured_collections (
  id text primary key,
  store_id text not null default 'daily-outfit',
  title text not null default '',
  subtitle text not null default '',
  cover_image text not null default '',
  button_text text not null default '',
  button_url text not null default '',
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'Draft' check (status in ('Published', 'Draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.featured_collection_items (
  id text primary key,
  collection_id text not null references public.featured_collections(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  unique (collection_id, product_id)
);

create index if not exists featured_collections_store_id_idx on public.featured_collections(store_id);
create index if not exists featured_collections_status_idx on public.featured_collections(status);
create index if not exists featured_collections_sort_order_idx on public.featured_collections(sort_order);
create index if not exists featured_collections_starts_at_idx on public.featured_collections(starts_at);
create index if not exists featured_collections_ends_at_idx on public.featured_collections(ends_at);
create index if not exists featured_collection_items_collection_id_idx on public.featured_collection_items(collection_id);
create index if not exists featured_collection_items_sort_order_idx on public.featured_collection_items(sort_order);

alter table public.featured_collections enable row level security;
alter table public.featured_collection_items enable row level security;

drop policy if exists "Authenticated manage featured collections" on public.featured_collections;
create policy "Authenticated manage featured collections"
  on public.featured_collections
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage featured collection items" on public.featured_collection_items;
create policy "Authenticated manage featured collection items"
  on public.featured_collection_items
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.featured_collections (
  id,
  store_id,
  title,
  subtitle,
  cover_image,
  button_text,
  button_url,
  sort_order,
  status
) values
  (
    'fc-daily-dresses',
    'daily-outfit',
    'Evening Dresses',
    'Clean silhouettes for dinners, openings, and quiet everyday ceremony.',
    '/images/ivory-dress.png',
    'Shop dresses',
    '/categories/dresses',
    0,
    'Published'
  ),
  (
    'fc-daily-layers',
    'daily-outfit',
    'Refined Layers',
    'Soft blouses, structured vests, and polished everyday tailoring.',
    '/images/silk-blouse-jeans.png',
    'Explore tops',
    '/categories/tops',
    1,
    'Published'
  ),
  (
    'fc-daily-denim',
    'daily-outfit',
    'Modern Denim',
    'Dark denim with elevated proportions and a clean finish.',
    '/images/black-vest-trouser.png',
    'View denim',
    '/categories/jeans',
    2,
    'Published'
  ),
  (
    'fc-daily-accessories',
    'daily-outfit',
    'Finishing Touches',
    'Structured bags and quiet accessories in neutral finishes.',
    '/images/accessories.png',
    'Shop accessories',
    '/categories/accessories',
    3,
    'Published'
  )
on conflict (id) do update set
  store_id = excluded.store_id,
  title = excluded.title,
  subtitle = excluded.subtitle,
  cover_image = excluded.cover_image,
  button_text = excluded.button_text,
  button_url = excluded.button_url,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

insert into public.featured_collection_items (id, collection_id, product_id, sort_order) values
  ('fci-1', 'fc-daily-dresses', 'prd-linen-wrap-dress', 0),
  ('fci-2', 'fc-daily-layers', 'prd-black-waistcoat', 0),
  ('fci-3', 'fc-daily-layers', 'prd-satin-blouse', 1),
  ('fci-4', 'fc-daily-denim', 'prd-wide-jean', 0),
  ('fci-5', 'fc-daily-accessories', 'prd-mini-tote', 0)
on conflict (id) do update set
  collection_id = excluded.collection_id,
  product_id = excluded.product_id,
  sort_order = excluded.sort_order;
