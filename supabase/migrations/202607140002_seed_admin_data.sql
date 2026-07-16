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
  ('prd-ivory-column', 'Ivory Column Midi Dress', 'AL-DR-1001', '8850001001001', 'cat-dresses', 'Atelier Lune', 585000, 548000, 312000, 'Sleeveless midi dress with a softened column line and refined matte finish.', array['/images/ivory-dress.png', '/images/hero-boutique.png'], array['Ivory', 'Black'], array['XS', 'S', 'M', 'L', 'XL'], 18, 6, true, true, true, true, 'Published', '2026-07-10'),
  ('prd-black-waistcoat', 'Tailored Black Waistcoat', 'AL-TP-2042', '8850002042002', 'cat-tops', 'Atelier Lune', 392000, null, 211000, 'Sharply cut waistcoat with a clean V neckline and subtle waist shaping.', array['/images/black-vest-trouser.png', '/images/new-collection.png'], array['Black', 'Warm Taupe'], array['XS', 'S', 'M', 'L'], 9, 10, true, true, true, false, 'Published', '2026-07-09'),
  ('prd-satin-blouse', 'Satin Ease Blouse', 'AL-TP-2037', '8850002037008', 'cat-tops', 'Atelier Lune', 329000, 299000, 176000, 'Fluid satin blouse shaped with a relaxed collar and soft cuffs.', array['/images/silk-blouse-jeans.png', '/images/store-interior.png'], array['Cream', 'Graphite'], array['XS', 'S', 'M', 'L', 'XL', 'XXL'], 26, 8, false, false, true, true, 'Published', '2026-07-08'),
  ('prd-wide-jean', 'Sculpted Wide Jean', 'AL-JN-3008', '8850003008007', 'cat-jeans', 'Atelier Lune Denim', 413000, null, 235000, 'Dark-rinse wide jean with a high rise and structured denim finish.', array['/images/silk-blouse-jeans.png', '/images/black-vest-trouser.png'], array['Deep Indigo', 'Washed Black'], array['XS', 'S', 'M', 'L', 'XL'], 14, 5, false, true, false, false, 'Published', '2026-07-07'),
  ('prd-mini-tote', 'Structured Mini Tote', 'AL-BG-5104', '8850005104004', 'cat-bags', 'Atelier Lune Leather', 658000, null, 384000, 'Compact structured tote in grained leather with a clean flap.', array['/images/accessories.png', '/images/store-interior.png'], array['Taupe', 'Black'], array['One size'], 7, 4, true, true, false, false, 'Draft', '2026-07-06')
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
  ('bnr-home-hero', 'Spring Collection Hero', 'Homepage Hero', '/images/hero-boutique.png', 'Spring collection', 'Atelier Lune', 'Shop Collection', '/shop', 'Published'),
  ('bnr-new-collection', 'Soft Tailoring Feature', 'New Collection', '/images/new-collection.png', 'New collection', 'Soft tailoring, softened further.', 'View new arrivals', '/shop', 'Published')
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
  'store', 'Atelier Lune', '/app/icon.svg', 'Premium minimal pieces for a quiet, edited wardrobe.',
  'https://facebook.com/atelierlune', 'https://m.me/atelierlune', 'viber://chat?number=%2B959421000112',
  'https://t.me/atelierlune', 'https://tiktok.com/@atelierlune', 'https://instagram.com/atelierlune',
  'hello@atelierlune.example', '+95 9 421 000 112', '24 Garosu-gil, Gangnam-gu, Seoul',
  'https://www.google.com/maps?q=Garosu-gil%2C%20Gangnam-gu%2C%20Seoul', 'MMK', 'Asia/Yangon', current_date
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
