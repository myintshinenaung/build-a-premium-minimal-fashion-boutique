-- Performance & Scalability indexes

create index if not exists order_items_product_id_idx on public.order_items(product_id);
create index if not exists wishlist_product_id_idx on public.wishlist(product_id);
create index if not exists products_status_best_seller_idx on public.products(status, best_seller);
create index if not exists products_status_new_arrival_idx on public.products(status, new_arrival);
create index if not exists products_status_featured_idx on public.products(status, featured);
create index if not exists product_reviews_status_product_id_idx on public.product_reviews(status, product_id);
create index if not exists orders_payment_status_created_at_idx on public.orders(payment_status, created_at desc);
