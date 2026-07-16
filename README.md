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

Create a local `.env` file from `.env.example` when connecting Supabase later:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The current build still uses local mock data. Supabase client helpers and repository boundaries are prepared for future integration, but no live database connection is required.

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
lib/repositories/     Admin product, category, banner, and settings data boundaries
lib/services/         Admin service layer for future business rules
lib/supabase/         Supabase client, server, and generated type placeholders
lib/                  Product data and helpers
types/                Product TypeScript models
public/images/        Local boutique and product imagery
```

## Product Data

Example product data lives in `lib/products.ts`. Replace or connect this file to a CMS, database, or commerce backend when moving from demo data to production inventory.

## Notes

The site intentionally avoids dark mode, bright gradients, heavy animation, and decorative clutter to preserve the premium minimal design direction.
