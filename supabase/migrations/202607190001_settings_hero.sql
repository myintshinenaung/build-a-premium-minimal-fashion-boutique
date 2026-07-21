alter table settings
  add column if not exists hero_title_en text not null default '',
  add column if not exists hero_title_my text not null default '',
  add column if not exists hero_subtitle_en text not null default '',
  add column if not exists hero_subtitle_my text not null default '',
  add column if not exists hero_marketing_headline_en text not null default '',
  add column if not exists hero_marketing_headline_my text not null default '',
  add column if not exists hero_cta_label_en text not null default '',
  add column if not exists hero_cta_label_my text not null default '',
  add column if not exists hero_secondary_cta_label_en text not null default '',
  add column if not exists hero_secondary_cta_label_my text not null default '',
  add column if not exists hero_primary_cta_href text not null default '/shop',
  add column if not exists hero_secondary_cta_href text not null default '/categories',
  add column if not exists hero_background_image text not null default '';
