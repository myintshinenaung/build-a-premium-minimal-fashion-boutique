import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { bestSellers, categories, newArrivals } from "@/lib/products";

const featuredCategories = categories.filter((category) =>
  ["Dresses", "Tops", "Pants", "Bags"].includes(category.name)
);

const galleryImages = [
  { src: "/images/ivory-dress.png", alt: "Ivory midi dress editorial" },
  { src: "/images/black-vest-trouser.png", alt: "Black vest and tailored trouser editorial" },
  { src: "/images/silk-blouse-jeans.png", alt: "Satin blouse with wide denim editorial" },
  { src: "/images/accessories.png", alt: "Leather shoes and structured handbag" },
  { src: "/images/store-interior.png", alt: "Minimal boutique interior" },
  { src: "/images/new-collection.png", alt: "Neutral tailored collection editorial" }
];

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[78svh] overflow-hidden">
        <div className="absolute inset-0">
          <BoutiqueImage
            src="/images/hero-boutique.png"
            alt="Atelier Lune minimal fashion editorial"
            priority
            className="h-full w-full"
            imageClassName="object-[55%_center] md:object-center"
            sizes="100vw"
          />
        </div>
        <div className="relative mx-auto flex min-h-[78svh] max-w-[1440px] items-end px-4 pb-16 pt-24 sm:px-6 md:pb-20 lg:px-8">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-stone">Spring collection</p>
            <h1 className="text-5xl font-medium leading-[0.98] text-ink sm:text-6xl md:text-7xl">Atelier Lune</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-stone">
              A quiet wardrobe of dresses, tailoring, denim, leather goods, and refined daily essentials.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-stone"
              >
                Shop Collection
                <ArrowRight size={17} strokeWidth={1.7} />
              </Link>
              <Link
                href="/categories"
                className="inline-flex h-12 items-center justify-center border border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-white/70"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <BoutiqueImage
            src="/images/new-collection.png"
            alt="Neutral tailored new collection"
            className="aspect-[16/10] rounded-[2px]"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">New collection</p>
            <h2 className="mt-4 text-3xl font-medium leading-tight text-ink md:text-5xl">Soft tailoring, softened further.</h2>
            <p className="mt-5 text-sm leading-7 text-stone md:text-base">
              The latest edit focuses on fluid trousers, clean jackets, satin surfaces, and pared-back accessories designed
              to work together without effort.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-8"
            >
              View new arrivals
              <ArrowRight size={16} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured categories"
            title="A focused edit for every day"
            description="Shop by silhouette, texture, and the pieces that make a wardrobe feel considered."
          />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {featuredCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="group bg-white">
                <BoutiqueImage
                  src={category.image}
                  alt={category.name}
                  className="aspect-[4/5]"
                  imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
                <div className="p-4">
                  <h3 className="text-sm font-medium text-ink">{category.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Best sellers"
          title="Pieces with quiet momentum"
          action={
            <Link href="/shop" className="text-sm font-medium text-ink underline underline-offset-8">
              Shop all
            </Link>
          }
        />
        <div className="mt-10">
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="New arrivals"
          title="Fresh proportion, same restraint"
          description="New pieces are edited for compatibility first: clean lines, neutral tones, and fabrics that hold their shape."
        />
        <div className="mt-10">
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">About the brand</p>
            <h2 className="mt-4 text-3xl font-medium leading-tight text-ink md:text-5xl">Designed to make less feel complete.</h2>
            <p className="mt-5 text-sm leading-7 text-stone md:text-base">
              Atelier Lune builds around the pieces that stay: refined shapes, practical proportions, and tactile neutrals
              that make daily dressing feel measured and calm.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-8"
            >
              Read our story
              <ArrowRight size={16} strokeWidth={1.6} />
            </Link>
          </div>
          <BoutiqueImage
            src="/images/store-interior.png"
            alt="Atelier Lune boutique interior"
            className="aspect-[16/10] rounded-[2px]"
            sizes="(min-width: 1024px) 56vw, 100vw"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Instagram" title="From the fitting room" description="@atelierlune" />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {galleryImages.map((image, index) => (
            <BoutiqueImage
              key={`${image.src}-${index}`}
              src={image.src}
              alt={image.alt}
              className="aspect-square rounded-[2px]"
              sizes="(min-width: 1024px) 16vw, 33vw"
            />
          ))}
        </div>
      </section>
    </>
  );
}
