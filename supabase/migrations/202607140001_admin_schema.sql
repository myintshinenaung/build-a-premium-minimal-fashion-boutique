create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  image text not null default '',
  product_count integer not null default 0 check (product_count >= 0),
  sort_order integer not null default 1,
  status text not null default 'Draft' check (status in ('Published', 'Draft'))
);

create table if not exists products (
  id text primary key,
  name text not null,
  sku text not null unique,
  barcode text not null default '',
  category_id text not null references categories(id) on update cascade on delete restrict,
  brand text not null default '',
  price_mmk integer not null default 0 check (price_mmk >= 0),
  sale_price_mmk integer check (sale_price_mmk is null or sale_price_mmk >= 0),
  cost_price_mmk integer not null default 0 check (cost_price_mmk >= 0),
  description text not null default '',
  images text[] not null default '{}',
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_warning integer not null default 0 check (low_stock_warning >= 0),
  featured boolean not null default false,
  best_seller boolean not null default false,
  new_arrival boolean not null default false,
  on_sale boolean not null default false,
  status text not null default 'Draft' check (status in ('Published', 'Draft')),
  updated_at date not null default current_date
);

create table if not exists banners (
  id text primary key,
  title text not null,
  placement text not null check (placement in ('Homepage Hero', 'New Collection', 'Announcement')),
  image text not null default '',
  eyebrow text not null default '',
  headline text not null default '',
  cta_label text not null default '',
  cta_href text not null default '/shop',
  status text not null default 'Draft' check (status in ('Published', 'Draft'))
);

create table if not exists customers (
  id text primary key,
  name text not null,
  phone text not null default '',
  orders integer not null default 0 check (orders >= 0),
  lifetime_value_mmk integer not null default 0 check (lifetime_value_mmk >= 0),
  last_order_at date not null default current_date
);

create table if not exists orders (
  id text primary key,
  customer text not null,
  total_mmk integer not null default 0 check (total_mmk >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Packed', 'Completed')),
  channel text not null default 'Messenger' check (channel in ('Messenger', 'Viber', 'Phone')),
  created_at date not null default current_date
);

create table if not exists settings (
  id text primary key default 'store',
  store_name text not null default '',
  logo text not null default '',
  store_description text not null default '',
  facebook text not null default '',
  messenger text not null default '',
  viber text not null default '',
  telegram text not null default '',
  tiktok text not null default '',
  instagram text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  google_map text not null default '',
  currency text not null default 'MMK',
  timezone text not null default 'Asia/Yangon',
  updated_at date not null default current_date
);

create index if not exists products_category_id_idx on products(category_id);
create index if not exists products_status_idx on products(status);
create index if not exists categories_sort_order_idx on categories(sort_order);
create index if not exists banners_placement_idx on banners(placement);
create index if not exists orders_created_at_idx on orders(created_at desc);
