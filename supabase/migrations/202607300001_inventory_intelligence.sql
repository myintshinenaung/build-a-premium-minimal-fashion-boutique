-- Inventory Intelligence MVP

create table if not exists public.warehouses (
  id text primary key,
  name text not null,
  code text not null unique,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.warehouse_stock (
  id text primary key,
  warehouse_id text not null references public.warehouses(id) on delete cascade,
  product_id text not null,
  quantity integer not null default 0 check (quantity >= 0),
  incoming_quantity integer not null default 0 check (incoming_quantity >= 0),
  updated_at timestamptz not null default now(),
  unique (warehouse_id, product_id)
);

create table if not exists public.inventory_movements (
  id text primary key,
  product_id text not null,
  warehouse_id text not null references public.warehouses(id),
  movement_type text not null,
  quantity integer not null,
  quantity_before integer not null check (quantity_before >= 0),
  quantity_after integer not null check (quantity_after >= 0),
  user_id text,
  user_name text not null,
  reason text not null,
  reference_type text,
  reference_id text,
  created_at timestamptz not null default now()
);

alter table public.inventory_movements drop constraint if exists inventory_movements_type_check;
alter table public.inventory_movements
  add constraint inventory_movements_type_check
  check (
    movement_type in (
      'purchase',
      'sale',
      'reservation',
      'release',
      'return',
      'damage',
      'manual_adjustment',
      'warehouse_transfer'
    )
  );

create table if not exists public.inventory_alert_settings (
  id text primary key,
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  critical_stock_threshold integer not null default 2 check (critical_stock_threshold >= 0),
  overstock_threshold integer not null default 100 check (overstock_threshold > 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_product_alert_settings (
  product_id text primary key,
  low_stock_threshold integer check (low_stock_threshold >= 0),
  critical_stock_threshold integer check (critical_stock_threshold >= 0),
  overstock_threshold integer check (overstock_threshold > 0)
);

create index if not exists inventory_movements_product_id_idx on public.inventory_movements(product_id);
create index if not exists inventory_movements_warehouse_id_idx on public.inventory_movements(warehouse_id);
create index if not exists inventory_movements_created_at_idx on public.inventory_movements(created_at desc);
create index if not exists warehouse_stock_product_id_idx on public.warehouse_stock(product_id);

insert into public.warehouses (id, name, code, is_default)
values
  ('WH-MAIN', 'Main Warehouse', 'MAIN', true),
  ('WH-OVERFLOW', 'Overflow Warehouse', 'OVERFLOW', false)
on conflict (id) do nothing;

insert into public.inventory_alert_settings (id, low_stock_threshold, critical_stock_threshold, overstock_threshold)
values ('default', 5, 2, 100)
on conflict (id) do nothing;

insert into public.warehouse_stock (id, warehouse_id, product_id, quantity, incoming_quantity, updated_at)
select
  'WST-' || p.id || '-MAIN',
  'WH-MAIN',
  p.id,
  p.stock_quantity,
  0,
  now()
from public.products p
on conflict (warehouse_id, product_id) do nothing;

alter table public.warehouses enable row level security;
alter table public.warehouse_stock enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.inventory_alert_settings enable row level security;
alter table public.inventory_product_alert_settings enable row level security;

drop policy if exists "Authenticated manage warehouses" on public.warehouses;
create policy "Authenticated manage warehouses"
  on public.warehouses for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage warehouse_stock" on public.warehouse_stock;
create policy "Authenticated manage warehouse_stock"
  on public.warehouse_stock for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage inventory_movements" on public.inventory_movements;
create policy "Authenticated manage inventory_movements"
  on public.inventory_movements for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage inventory_alert_settings" on public.inventory_alert_settings;
create policy "Authenticated manage inventory_alert_settings"
  on public.inventory_alert_settings for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage inventory_product_alert_settings" on public.inventory_product_alert_settings;
create policy "Authenticated manage inventory_product_alert_settings"
  on public.inventory_product_alert_settings for all to authenticated using (true) with check (true);
