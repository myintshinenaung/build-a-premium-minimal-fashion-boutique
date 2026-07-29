insert into categories (id, name, slug, description, image, product_count, sort_order, status) values
  ('cat-dresses', 'Dresses', 'dresses', 'Clean silhouettes for dinners, openings, and quiet everyday ceremony.', '/images/ivory-dress.png', 1, 1, 'Published'),
  ('cat-tops', 'Tops', 'tops', 'Soft blouses, structured vests, and refined layers.', '/images/silk-blouse-jeans.png', 5, 2, 'Published'),
  ('cat-pants', 'Pants', 'pants', 'Tailored trousers with ease, shape, and movement.', '/images/black-vest-trouser.png', 2, 3, 'Published'),
  ('cat-jeans', 'Jeans', 'jeans', 'Dark denim with polished proportions.', '/images/silk-blouse-jeans.png', 1, 4, 'Published'),
  ('cat-shoes', 'Shoes', 'shoes', 'Minimal footwear made to anchor the wardrobe.', '/images/accessories.png', 1, 5, 'Published'),
  ('cat-bags', 'Bags', 'bags', 'Structured leather pieces in neutral finishes.', '/images/accessories.png', 1, 6, 'Published'),
  ('cat-accessories', 'Accessories', 'accessories', 'Quiet finishing pieces with enduring texture.', '/images/accessories.png', 2, 7, 'Published')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  image = excluded.image,
  product_count = excluded.product_count,
  sort_order = excluded.sort_order,
  status = excluded.status;

insert into products (
  id, name, sku, barcode, category_id, brand, price_mmk, sale_price_mmk, cost_price_mmk, description,
  images, colors, sizes, stock_quantity, low_stock_warning, featured, best_seller, new_arrival, on_sale, status, updated_at
) values
  ('prd-linen-wrap-dress', 'Linen Wrap Midi Dress', 'DO-DR-1001', '8850001001001', 'cat-dresses', 'Daily Outfit', 585000, 548000, 312000, 'Breathable linen midi dress with a soft wrap silhouette for everyday wear.', array['/images/ivory-dress.png', '/images/hero-boutique.png'], array['Natural', 'Black'], array['XS', 'S', 'M', 'L', 'XL'], 18, 6, true, true, true, true, 'Published', '2026-07-10'),
  ('prd-black-waistcoat', 'Tailored Black Waistcoat', 'DO-TP-2042', '8850002042002', 'cat-tops', 'Daily Outfit', 392000, null, 211000, 'Structured waistcoat with a clean neckline and sharp daily tailoring.', array['/images/black-vest-trouser.png', '/images/new-collection.png'], array['Black', 'Warm Taupe'], array['XS', 'S', 'M', 'L'], 9, 10, true, true, true, false, 'Published', '2026-07-09'),
  ('prd-satin-blouse', 'Satin Ease Blouse', 'DO-TP-2037', '8850002037008', 'cat-tops', 'Daily Outfit', 329000, 299000, 176000, 'Lightweight satin blouse with relaxed cuffs and an easy drape.', array['/images/silk-blouse-jeans.png', '/images/store-interior.png'], array['Cream', 'Graphite'], array['XS', 'S', 'M', 'L', 'XL', 'XXL'], 26, 8, false, false, true, true, 'Published', '2026-07-08'),
  ('prd-wide-jean', 'High-Rise Wide Leg Jean', 'DO-JN-3008', '8850003008007', 'cat-jeans', 'Daily Outfit Denim', 413000, null, 235000, 'Deep indigo wide-leg jean with a high rise and clean finish.', array['/images/silk-blouse-jeans.png', '/images/black-vest-trouser.png'], array['Deep Indigo', 'Washed Black'], array['XS', 'S', 'M', 'L', 'XL'], 14, 5, false, true, false, false, 'Published', '2026-07-07'),
  ('prd-mini-tote', 'Structured Mini Tote', 'DO-BG-5104', '8850005104004', 'cat-bags', 'Luxe Lane', 658000, null, 384000, 'Compact structured tote in grained leather with a minimal flap.', array['/images/accessories.png', '/images/store-interior.png'], array['Taupe', 'Black'], array['One size'], 7, 4, true, true, false, false, 'Draft', '2026-07-06')
on conflict (id) do update set
  name = excluded.name,
  sku = excluded.sku,
  barcode = excluded.barcode,
  category_id = excluded.category_id,
  brand = excluded.brand,
  price_mmk = excluded.price_mmk,
  sale_price_mmk = excluded.sale_price_mmk,
  cost_price_mmk = excluded.cost_price_mmk,
  description = excluded.description,
  images = excluded.images,
  colors = excluded.colors,
  sizes = excluded.sizes,
  stock_quantity = excluded.stock_quantity,
  low_stock_warning = excluded.low_stock_warning,
  featured = excluded.featured,
  best_seller = excluded.best_seller,
  new_arrival = excluded.new_arrival,
  on_sale = excluded.on_sale,
  status = excluded.status,
  updated_at = excluded.updated_at;

insert into banners (id, title, placement, image, eyebrow, headline, cta_label, cta_href, status) values
  ('bnr-home-hero', 'Daily Outfit New Season Hero', 'Homepage Hero', '/images/hero-boutique.png', 'New season', 'Daily Outfit', 'Shop Now', '/shop', 'Published'),
  ('bnr-new-collection', 'Daily Outfit New Arrivals', 'New Collection', '/images/new-collection.png', 'New arrivals', 'Curated edits for the season ahead', 'View new arrivals', '/shop', 'Published')
on conflict (id) do update set
  title = excluded.title,
  placement = excluded.placement,
  image = excluded.image,
  eyebrow = excluded.eyebrow,
  headline = excluded.headline,
  cta_label = excluded.cta_label,
  cta_href = excluded.cta_href,
  status = excluded.status;

insert into customers (id, name, phone, orders, lifetime_value_mmk, last_order_at) values
  ('CUS-810', 'May Thiri', '+95 9 421 000 112', 3, 1653000, '2026-07-10'),
  ('CUS-744', 'Nandar Lin', '+95 9 500 331 221', 1, 392000, '2026-07-09'),
  ('CUS-701', 'Hnin Wai', '+95 9 777 304 881', 4, 2249000, '2026-07-08')
on conflict (id) do update set
  name = excluded.name,
  phone = excluded.phone,
  orders = excluded.orders,
  lifetime_value_mmk = excluded.lifetime_value_mmk,
  last_order_at = excluded.last_order_at;

insert into orders (id, customer, total_mmk, status, channel, created_at) values
  ('ORD-1042', 'May Thiri', 877000, 'Pending', 'Messenger', '2026-07-10'),
  ('ORD-1041', 'Nandar Lin', 392000, 'Confirmed', 'Viber', '2026-07-09'),
  ('ORD-1040', 'Hnin Wai', 658000, 'Packed', 'Phone', '2026-07-08')
on conflict (id) do update set
  customer = excluded.customer,
  total_mmk = excluded.total_mmk,
  status = excluded.status,
  channel = excluded.channel,
  created_at = excluded.created_at;

insert into settings (
  id, store_name, logo, store_description, facebook, messenger, viber, telegram, tiktok, instagram,
  email, phone, address, google_map, currency, timezone, updated_at
) values (
  'store', 'Daily Outfit', '/app/icon.svg', 'Curated fashion for modern wardrobes across the NOVORA marketplace.',
  'https://facebook.com/dailyoutfit', 'https://m.me/dailyoutfit', 'viber://chat?number=%2B959421000112',
  'https://t.me/dailyoutfit', 'https://tiktok.com/@dailyoutfit', 'https://instagram.com/dailyoutfit',
  'hello@dailyoutfit.example', '+95 9 421 000 112', 'Junction City, Yangon',
  'https://www.google.com/maps?q=Junction+City+Yangon', 'MMK', 'Asia/Yangon', current_date
)
on conflict (id) do update set
  store_name = excluded.store_name,
  logo = excluded.logo,
  store_description = excluded.store_description,
  facebook = excluded.facebook,
  messenger = excluded.messenger,
  viber = excluded.viber,
  telegram = excluded.telegram,
  tiktok = excluded.tiktok,
  instagram = excluded.instagram,
  email = excluded.email,
  phone = excluded.phone,
  address = excluded.address,
  google_map = excluded.google_map,
  currency = excluded.currency,
  timezone = excluded.timezone,
  updated_at = excluded.updated_at;
