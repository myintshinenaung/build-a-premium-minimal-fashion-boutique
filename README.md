# Atelier Lune Boutique

Premium minimal fashion boutique built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- Mobile-first luxury boutique layout
- Home, categories, shop, product detail, about, contact, sitemap, and robots routes
- Search, filters, sorting, and pagination on product listings
- Product data with category, price, description, images, sizes, colors, stock status, new arrival, and best seller flags
- Reusable image, layout, product card, gallery, order, and share components
- Messenger, Viber, email, phone, Facebook, and Google Map contact paths
- Local generated fashion imagery served through Next image optimization
- Strict TypeScript setup and ESLint configuration

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create a local `.env` file from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Admin Authentication

Admin routes use Supabase Auth with cookie-based sessions. Create at least one admin user in your Supabase project, then sign in at `/admin/login`.

Password reset emails use `NEXT_PUBLIC_SITE_URL` as the redirect base. Apply the RLS migration in `supabase/migrations/20260717000000_enable_admin_rls.sql` when hardening database access for anon and authenticated roles.

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Project Structure

```text
app/                  App Router pages and SEO routes
components/layout/    Header and footer
components/product/   Product cards, listing filters, gallery, share and order controls
components/ui/        Shared image and section primitives
lib/storefront/     Storefront catalog service backed by Supabase
lib/repositories/     Admin product, category, banner, and settings data boundaries
lib/services/         Admin service layer for future business rules
lib/supabase/         Supabase client, server, and generated type placeholders
lib/                  Helpers and admin utilities
types/                Product TypeScript models
public/images/        Local boutique and product imagery
```

## Product Data

The public storefront reads published products and categories from Supabase through `lib/storefront/catalog.ts`. Admin changes to published inventory appear on the live site after refresh.

## Notes

The site intentionally avoids dark mode, bright gradients, heavy animation, and decorative clutter to preserve the premium minimal design direction.
