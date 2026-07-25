-- Payment MVP: order payment fields and webhook idempotency.

alter table public.orders
  add column if not exists payment_id text,
  add column if not exists payment_provider text,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists paid_at timestamptz;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'processing', 'paid', 'failed'));

alter table public.orders drop constraint if exists orders_payment_provider_check;
alter table public.orders
  add constraint orders_payment_provider_check
  check (payment_provider is null or payment_provider in ('stripe'));

create table if not exists public.payment_events (
  id text primary key,
  provider text not null,
  event_type text not null,
  order_id text references public.orders(id) on delete set null,
  processed_at timestamptz not null default now()
);

create index if not exists payment_events_order_id_idx on public.payment_events(order_id);

alter table public.payment_events enable row level security;

drop policy if exists "Authenticated manage payment_events" on public.payment_events;
create policy "Authenticated manage payment_events"
  on public.payment_events
  for all
  to authenticated
  using (true)
  with check (true);
