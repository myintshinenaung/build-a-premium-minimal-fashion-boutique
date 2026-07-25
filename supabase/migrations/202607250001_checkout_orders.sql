-- Checkout MVP: extend orders and add order line items.

alter table public.orders
  add column if not exists customer_phone text not null default '',
  add column if not exists customer_email text not null default '',
  add column if not exists shipping_address text not null default '',
  add column if not exists township text not null default '',
  add column if not exists notes text not null default '',
  add column if not exists subtotal_mmk integer not null default 0 check (subtotal_mmk >= 0),
  add column if not exists shipping_mmk integer not null default 0 check (shipping_mmk >= 0);

alter table public.orders drop constraint if exists orders_channel_check;
alter table public.orders
  add constraint orders_channel_check check (channel in ('Messenger', 'Viber', 'Phone', 'Web'));

create table if not exists public.order_items (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null,
  variant_id text not null,
  product_name text not null,
  product_slug text not null,
  image text not null default '',
  size text not null,
  color text not null,
  unit_price_mmk integer not null check (unit_price_mmk >= 0),
  quantity integer not null check (quantity > 0),
  line_total_mmk integer not null check (line_total_mmk >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.order_items enable row level security;

drop policy if exists "Authenticated manage order_items" on public.order_items;
create policy "Authenticated manage order_items"
  on public.order_items
  for all
  to authenticated
  using (true)
  with check (true);
