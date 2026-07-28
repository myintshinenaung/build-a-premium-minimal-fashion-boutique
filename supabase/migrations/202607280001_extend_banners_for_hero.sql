-- Extend banners for dashboard-driven hero carousel (Sprint 1 — NOVORA V1 Hero)

alter table banners
  add column if not exists mobile_image text not null default '',
  add column if not exists sort_order integer not null default 0,
  add column if not exists store_name text not null default '',
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz;

create index if not exists banners_sort_order_idx on banners(sort_order);
create index if not exists banners_starts_at_idx on banners(starts_at);
create index if not exists banners_ends_at_idx on banners(ends_at);

update banners
set
  sort_order = case id
    when 'bnr-home-hero' then 0
    when 'bnr-new-collection' then 1
    else sort_order
  end,
  store_name = case id
    when 'bnr-home-hero' then 'Daily Outfit'
    else store_name
  end
where id in ('bnr-home-hero', 'bnr-new-collection');
