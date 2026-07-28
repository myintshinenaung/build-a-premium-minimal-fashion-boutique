-- Remove duplicated demo products and refresh catalog with Daily Outfit / NOVORA marketplace data.

delete from products
where name ilike '% — duplicate%'
   or name ~ ' [Cc][Oo][Pp][Yy]([0-9]|$| )';

update products set
  id = 'prd-linen-wrap-dress',
  name = 'Linen Wrap Midi Dress',
  sku = 'DO-DR-1001',
  brand = 'Daily Outfit',
  description = 'Breathable linen midi dress with a soft wrap silhouette for everyday wear.',
  images = array['/images/ivory-dress.png', '/images/hero-boutique.png']
where sku = 'DO-DR-1001';

update products set
  name = 'Tailored Black Waistcoat',
  sku = 'DO-TP-2042',
  brand = 'Daily Outfit',
  description = 'Structured waistcoat with a clean neckline and sharp daily tailoring.'
where id = 'prd-black-waistcoat';

update products set
  name = 'Satin Ease Blouse',
  sku = 'DO-TP-2037',
  brand = 'Daily Outfit',
  description = 'Lightweight satin blouse with relaxed cuffs and an easy drape.'
where id = 'prd-satin-blouse';

update products set
  name = 'High-Rise Wide Leg Jean',
  sku = 'DO-JN-3008',
  brand = 'Daily Outfit Denim',
  description = 'Deep indigo wide-leg jean with a high rise and clean finish.'
where id = 'prd-wide-jean';

update products set
  name = 'Structured Mini Tote',
  sku = 'DO-BG-5104',
  brand = 'Luxe Lane',
  description = 'Compact structured tote in grained leather with a minimal flap.'
where id = 'prd-mini-tote';

update categories set
  image = '/images/ivory-dress.png'
where id = 'cat-dresses';

update banners set
  title = 'Daily Outfit New Season Hero',
  image = '/images/hero-boutique.png',
  eyebrow = 'New season',
  headline = 'Daily Outfit',
  cta_label = 'Shop Now'
where id = 'bnr-home-hero';

update banners set
  title = 'Daily Outfit New Arrivals',
  eyebrow = 'New arrivals',
  headline = 'Curated edits for the season ahead',
  cta_label = 'View new arrivals'
where id = 'bnr-new-collection';

update settings set
  store_name = 'Daily Outfit',
  store_description = 'Curated fashion for modern wardrobes across the NOVORA marketplace.',
  facebook = 'https://facebook.com/dailyoutfit',
  messenger = 'https://m.me/dailyoutfit',
  viber = 'viber://chat?number=%2B959421000112',
  telegram = 'https://t.me/dailyoutfit',
  tiktok = 'https://tiktok.com/@dailyoutfit',
  instagram = 'https://instagram.com/dailyoutfit',
  email = 'hello@dailyoutfit.example',
  address = 'Junction City, Yangon',
  google_map = 'https://www.google.com/maps?q=Junction+City+Yangon'
where id = 'store';
