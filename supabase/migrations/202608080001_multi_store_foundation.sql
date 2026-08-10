-- NOVORA Multi-Store Foundation V1
-- Creates real stores + platform taxonomy, scopes products to stores,
-- and hardens existing soft store_id columns with foreign keys.

-- ---------------------------------------------------------------------------
-- 1. Stores
-- ---------------------------------------------------------------------------

create table if not exists public.stores (
  id text primary key,
  name text not null,
  slug text not null unique,
  logo text not null default '',
  cover_image text not null default '',
  description text not null default '',
  monogram text not null default '',
  status text not null default 'inactive',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stores drop constraint if exists stores_status_check;
alter table public.stores
  add constraint stores_status_check
  check (status in ('active', 'inactive'));

create index if not exists stores_status_sort_idx on public.stores(status, sort_order);
create index if not exists stores_slug_idx on public.stores(slug);

alter table public.stores enable row level security;

drop policy if exists "Anon read active stores" on public.stores;
create policy "Anon read active stores"
  on public.stores
  for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "Authenticated manage stores" on public.stores;
create policy "Authenticated manage stores"
  on public.stores
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.stores (
  id, name, slug, logo, cover_image, description, monogram, status, sort_order
) values
  ('daily-outfit', 'Daily Outfit', 'daily-outfit', '', '/images/hero-boutique.png', 'Premium Fashion', 'DO', 'active', 0),
  ('myanmar-vibe', 'Myanmar Vibe Fashion', 'myanmar-vibe', '', '', 'Modern Myanmar Style', 'MV', 'inactive', 1),
  ('street-wear', 'Street Wear', 'street-wear', '', '', 'Urban Street Style', 'SW', 'inactive', 2),
  ('luxury-boutique', 'Luxury Boutique', 'luxury-boutique', '', '', 'Luxury Fashion', 'LB', 'inactive', 3),
  ('sports-wear', 'Sports Wear', 'sports-wear', '', '', 'Active Lifestyle', 'SP', 'inactive', 4),
  ('kids-fashion', 'Kids Fashion', 'kids-fashion', '', '', 'Kids & Family', 'KF', 'inactive', 5),
  ('beauty', 'Beauty', 'beauty', '', '', 'Beauty & Wellness', 'BE', 'inactive', 6)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  monogram = excluded.monogram,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2. Platform categories (marketplace taxonomy for stores)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  image text not null default '',
  sort_order integer not null default 0,
  status text not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.platform_categories drop constraint if exists platform_categories_status_check;
alter table public.platform_categories
  add constraint platform_categories_status_check
  check (status in ('active', 'inactive'));

create index if not exists platform_categories_status_sort_idx
  on public.platform_categories(status, sort_order);

alter table public.platform_categories enable row level security;

drop policy if exists "Anon read active platform categories" on public.platform_categories;
create policy "Anon read active platform categories"
  on public.platform_categories
  for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "Authenticated manage platform categories" on public.platform_categories;
create policy "Authenticated manage platform categories"
  on public.platform_categories
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.platform_categories (id, name, slug, description, sort_order, status) values
  ('pc-fashion', 'Fashion', 'fashion', 'Fashion stores on NOVORA', 0, 'active'),
  ('pc-beauty', 'Beauty', 'beauty', 'Beauty stores on NOVORA', 1, 'active'),
  ('pc-electronics', 'Electronics', 'electronics', 'Electronics stores on NOVORA', 2, 'active')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

create table if not exists public.store_platform_categories (
  store_id text not null references public.stores(id) on update cascade on delete cascade,
  platform_category_id text not null references public.platform_categories(id) on update cascade on delete cascade,
  sort_order integer not null default 0,
  primary key (store_id, platform_category_id)
);

create index if not exists store_platform_categories_platform_idx
  on public.store_platform_categories(platform_category_id, sort_order);

alter table public.store_platform_categories enable row level security;

drop policy if exists "Anon read store platform categories" on public.store_platform_categories;
create policy "Anon read store platform categories"
  on public.store_platform_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated manage store platform categories" on public.store_platform_categories;
create policy "Authenticated manage store platform categories"
  on public.store_platform_categories
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.store_platform_categories (store_id, platform_category_id, sort_order) values
  ('daily-outfit', 'pc-fashion', 0),
  ('myanmar-vibe', 'pc-fashion', 1),
  ('street-wear', 'pc-fashion', 2),
  ('luxury-boutique', 'pc-fashion', 3),
  ('sports-wear', 'pc-fashion', 4),
  ('kids-fashion', 'pc-fashion', 5),
  ('beauty', 'pc-beauty', 0)
on conflict (store_id, platform_category_id) do update set
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 3. Harden categories.store_id → stores.id
-- ---------------------------------------------------------------------------

update public.categories
set store_id = 'daily-outfit'
where store_id is null or store_id = '' or store_id not in (select id from public.stores);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'categories_slug_key'
  ) then
    alter table public.categories drop constraint categories_slug_key;
  end if;
exception
  when undefined_object then
    null;
end $$;

drop index if exists public.categories_slug_key;
create unique index if not exists categories_store_id_slug_uidx
  on public.categories(store_id, slug);

alter table public.categories drop constraint if exists categories_store_id_fkey;
alter table public.categories
  add constraint categories_store_id_fkey
  foreign key (store_id) references public.stores(id)
  on update cascade on delete restrict;

-- ---------------------------------------------------------------------------
-- 4. Scope products to stores (preserve Daily Outfit catalog)
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists store_id text;

update public.products p
set store_id = coalesce(c.store_id, 'daily-outfit')
from public.categories c
where p.category_id = c.id
  and (p.store_id is null or p.store_id = '');

update public.products
set store_id = 'daily-outfit'
where store_id is null or store_id = '' or store_id not in (select id from public.stores);

alter table public.products
  alter column store_id set default 'daily-outfit';

alter table public.products
  alter column store_id set not null;

create index if not exists products_store_id_idx on public.products(store_id);

alter table public.products drop constraint if exists products_store_id_fkey;
alter table public.products
  add constraint products_store_id_fkey
  foreign key (store_id) references public.stores(id)
  on update cascade on delete restrict;

-- ---------------------------------------------------------------------------
-- 5. Harden merchandising store_id FKs (keep existing daily-outfit rows)
-- ---------------------------------------------------------------------------

update public.flash_sales
set store_id = 'daily-outfit'
where store_id is null or store_id = '' or store_id not in (select id from public.stores);

alter table public.flash_sales drop constraint if exists flash_sales_store_id_fkey;
alter table public.flash_sales
  add constraint flash_sales_store_id_fkey
  foreign key (store_id) references public.stores(id)
  on update cascade on delete restrict;

update public.featured_collections
set store_id = 'daily-outfit'
where store_id is null or store_id = '' or store_id not in (select id from public.stores);

alter table public.featured_collections drop constraint if exists featured_collections_store_id_fkey;
alter table public.featured_collections
  add constraint featured_collections_store_id_fkey
  foreign key (store_id) references public.stores(id)
  on update cascade on delete restrict;

update public.product_rails
set store_id = 'daily-outfit'
where store_id is null or store_id = '' or store_id not in (select id from public.stores);

alter table public.product_rails drop constraint if exists product_rails_store_id_fkey;
alter table public.product_rails
  add constraint product_rails_store_id_fkey
  foreign key (store_id) references public.stores(id)
  on update cascade on delete restrict;
