-- Shipping MVP: order fulfillment fields and configurable flat-rate shipping.

alter table public.settings
  add column if not exists flat_rate_shipping_mmk integer not null default 5000 check (flat_rate_shipping_mmk >= 0);

alter table public.orders
  add column if not exists shipping_status text not null default 'pending',
  add column if not exists tracking_number text,
  add column if not exists carrier text;

alter table public.orders drop constraint if exists orders_shipping_status_check;
alter table public.orders
  add constraint orders_shipping_status_check
  check (shipping_status in ('pending', 'shipped'));
