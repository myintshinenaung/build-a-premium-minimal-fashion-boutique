import Link from "next/link";
import { getCategories } from "@/lib/storefront/catalog";

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.34em] text-ink">
            Atelier Lune
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-stone">
            Premium minimal pieces for a quiet, edited wardrobe. Designed around proportion, texture, and daily ease.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-ink">Shop</h2>
          <ul className="mt-5 space-y-3 text-sm text-stone">
            {categories.slice(0, 5).map((category) => (
              <li key={category.slug}>
                <Link className="transition-colors hover:text-ink" href={`/shop?category=${category.name}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-ink">Brand</h2>
          <ul className="mt-5 space-y-3 text-sm text-stone">
            <li>
              <Link className="transition-colors hover:text-ink" href="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ink" href="/contact">
                Contact
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ink" href="/shop">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.24em] text-ink">Visit</h2>
          <address className="mt-5 not-italic text-sm leading-6 text-stone">
            24 Garosu-gil
            <br />
            Gangnam-gu, Seoul
            <br />
            +1 555 014 6771
            <br />
            hello@atelierlune.example
          </address>
        </div>
      </div>
      <div className="border-t border-line px-4 py-5 text-center text-xs text-stone sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Atelier Lune. All rights reserved.
      </div>
    </footer>
  );
}
