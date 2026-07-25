-- Inventory Reservation MVP

create table if not exists public.inventory_reservations (
  id text primary key,
  product_id text not null,
  variant_id text not null,
  quantity integer not null check (quantity > 0),
  status text not null default 'active',
  reference_type text,
  reference_id text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_reservations drop constraint if exists inventory_reservations_status_check;
alter table public.inventory_reservations
  add constraint inventory_reservations_status_check
  check (status in ('active', 'released', 'consumed'));

create index if not exists inventory_reservations_product_id_idx on public.inventory_reservations(product_id);
create index if not exists inventory_reservations_variant_id_idx on public.inventory_reservations(variant_id);
create index if not exists inventory_reservations_status_expires_at_idx on public.inventory_reservations(status, expires_at);

alter table public.inventory_reservations enable row level security;

drop policy if exists "Authenticated manage inventory_reservations" on public.inventory_reservations;
create policy "Authenticated manage inventory_reservations"
  on public.inventory_reservations
  for all
  to authenticated
  using (true)
  with check (true);
