-- Flash Sale campaigns for dashboard-driven homepage merchandising (Sprint 3)

create table if not exists public.flash_sales (
  id text primary key,
  store_id text not null default 'daily-outfit',
  section_title text not null default '',
  section_subtitle text not null default '',
  badge_text text not null default '',
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'Draft' check (status in ('Published', 'Draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flash_sale_items (
  id text primary key,
  flash_sale_id text not null references public.flash_sales(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  discount_percent integer not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  sort_order integer not null default 0,
  unique (flash_sale_id, product_id)
);

create index if not exists flash_sales_store_id_idx on public.flash_sales(store_id);
create index if not exists flash_sales_status_idx on public.flash_sales(status);
create index if not exists flash_sales_starts_at_idx on public.flash_sales(starts_at);
create index if not exists flash_sales_ends_at_idx on public.flash_sales(ends_at);
create index if not exists flash_sale_items_flash_sale_id_idx on public.flash_sale_items(flash_sale_id);
create index if not exists flash_sale_items_sort_order_idx on public.flash_sale_items(sort_order);

alter table public.flash_sales enable row level security;
alter table public.flash_sale_items enable row level security;

drop policy if exists "Authenticated manage flash sales" on public.flash_sales;
create policy "Authenticated manage flash sales"
  on public.flash_sales
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage flash sale items" on public.flash_sale_items;
create policy "Authenticated manage flash sale items"
  on public.flash_sale_items
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.flash_sales (
  id,
  store_id,
  section_title,
  section_subtitle,
  badge_text,
  starts_at,
  ends_at,
  status
) values (
  'fs-daily-outfit-home',
  'daily-outfit',
  'Today''s best deals',
  'Limited-time offers across Daily Outfit',
  'Flash Sale',
  date_trunc('day', now()),
  (date_trunc('day', now()) + interval '1 day' - interval '1 second'),
  'Published'
)
on conflict (id) do update set
  section_title = excluded.section_title,
  section_subtitle = excluded.section_subtitle,
  badge_text = excluded.badge_text,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  updated_at = now();

insert into public.flash_sale_items (id, flash_sale_id, product_id, discount_percent, sort_order) values
  ('fsi-1', 'fs-daily-outfit-home', 'prd-ivory-column', 15, 0),
  ('fsi-2', 'fs-daily-outfit-home', 'prd-copy-7711', 10, 1),
  ('fsi-3', 'fs-daily-outfit-home', 'prd-copy-2752', 20, 2),
  ('fsi-4', 'fs-daily-outfit-home', 'prd-black-waistcoat', 12, 3)
on conflict (id) do update set
  product_id = excluded.product_id,
  discount_percent = excluded.discount_percent,
  sort_order = excluded.sort_order;
