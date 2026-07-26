-- Product Reviews & Ratings MVP

create table if not exists public.product_reviews (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  account_id text not null references public.customer_accounts(id) on delete cascade,
  order_id text references public.orders(id) on delete set null,
  rating integer not null,
  title text not null default '',
  body text not null,
  status text not null default 'pending',
  verified_purchase boolean not null default true,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_reviews drop constraint if exists product_reviews_rating_check;
alter table public.product_reviews
  add constraint product_reviews_rating_check
  check (rating between 1 and 5);

alter table public.product_reviews drop constraint if exists product_reviews_status_check;
alter table public.product_reviews
  add constraint product_reviews_status_check
  check (status in ('pending', 'published', 'rejected', 'hidden'));

alter table public.product_reviews drop constraint if exists product_reviews_helpful_count_check;
alter table public.product_reviews
  add constraint product_reviews_helpful_count_check
  check (helpful_count >= 0);

create unique index if not exists product_reviews_account_product_uidx
  on public.product_reviews(account_id, product_id);

create index if not exists product_reviews_product_id_idx on public.product_reviews(product_id);
create index if not exists product_reviews_status_idx on public.product_reviews(status);

create table if not exists public.review_helpful_votes (
  id text primary key,
  review_id text not null references public.product_reviews(id) on delete cascade,
  account_id text not null references public.customer_accounts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists review_helpful_votes_review_account_uidx
  on public.review_helpful_votes(review_id, account_id);

create table if not exists public.review_reports (
  id text primary key,
  review_id text not null references public.product_reviews(id) on delete cascade,
  account_id text not null references public.customer_accounts(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists review_reports_review_id_idx on public.review_reports(review_id);

alter table public.product_reviews enable row level security;
alter table public.review_helpful_votes enable row level security;
alter table public.review_reports enable row level security;

drop policy if exists "Authenticated manage product_reviews" on public.product_reviews;
create policy "Authenticated manage product_reviews"
  on public.product_reviews
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage review_helpful_votes" on public.review_helpful_votes;
create policy "Authenticated manage review_helpful_votes"
  on public.review_helpful_votes
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated manage review_reports" on public.review_reports;
create policy "Authenticated manage review_reports"
  on public.review_reports
  for all
  to authenticated
  using (true)
  with check (true);
