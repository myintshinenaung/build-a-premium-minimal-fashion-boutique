-- Scope categories to platform stores (Sprint 2 — NOVORA V1 Category Rail)

alter table categories
  add column if not exists store_id text not null default 'daily-outfit';

create index if not exists categories_store_id_idx on categories(store_id);

update categories
set store_id = 'daily-outfit'
where store_id is null or store_id = '';
