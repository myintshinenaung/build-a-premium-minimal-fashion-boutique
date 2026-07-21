import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHeroBanner } from "@/components/storefront/HomeHeroBanner";
import { NewCollectionBanner } from "@/components/storefront/NewCollectionBanner";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { getTranslator } from "@/lib/i18n/server-translator";
import { getStorefrontBannerByPlacement } from "@/lib/storefront/banners";
import { getBestSellers, getCategories, getNewArrivals } from "@/lib/storefront/catalog";
import { getInstagramHandle } from "@/lib/storefront/social";
import { getStoreSettings } from "@/lib/storefront/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { t } = await getTranslator();
  const [settings, categories, bestSellers, newArrivals, newCollectionBanner] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getBestSellers(),
    getNewArrivals(),
    getStorefrontBannerByPlacement("New Collection")
  ]);

  const featuredCategories = categories.filter((category) =>
    ["Dresses", "Tops", "Pants", "Bags"].includes(category.name)
  );

  const galleryImages = [
    { src: "/images/ivory-dress.png", alt: t("home.gallery.ivoryDress") },
    { src: "/images/black-vest-trouser.png", alt: t("home.gallery.blackVest") },
    { src: "/images/silk-blouse-jeans.png", alt: t("home.gallery.satinBlouse") },
    { src: "/images/accessories.png", alt: t("home.gallery.accessories") },
    { src: "/images/store-interior.png", alt: t("home.gallery.storeInterior") },
    { src: "/images/new-collection.png", alt: t("home.gallery.newCollection") }
  ];

  return (
    <>
      <HomeHeroBanner storeName={settings.storeName} hero={settings.hero} />

      <NewCollectionBanner
        banner={newCollectionBanner}
        labels={{
          viewNewArrivals: t("common.viewNewArrivals"),
          fallbackImageAlt: t("home.gallery.newCollection")
        }}
      />

      <section className="bg-mist py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t("home.featuredCategories.eyebrow")}
            title={t("home.featuredCategories.title")}
            description={t("home.featuredCategories.description")}
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
          eyebrow={t("home.bestSellers.eyebrow")}
          title={t("home.bestSellers.title")}
          action={
            <Link href="/shop" className="text-sm font-medium text-ink underline underline-offset-8">
              {t("common.shopAll")}
            </Link>
          }
        />
        <div className="mt-10">
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("home.newArrivals.eyebrow")}
          title={t("home.newArrivals.title")}
          description={t("home.newArrivals.description")}
        />
        <div className="mt-10">
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">{t("home.aboutTeaser.eyebrow")}</p>
            <h2 className="mt-4 text-3xl font-medium leading-tight text-ink md:text-5xl">{t("home.aboutTeaser.title")}</h2>
            <p className="mt-5 text-sm leading-7 text-stone md:text-base">
              {t("home.aboutTeaser.description", { storeName: settings.storeName })}
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-8"
            >
              {t("common.readOurStory")}
              <ArrowRight size={16} strokeWidth={1.6} />
            </Link>
          </div>
          <BoutiqueImage
            src="/images/store-interior.png"
            alt={t("home.gallery.storeInterior")}
            className="aspect-[16/10] rounded-[2px]"
            sizes="(min-width: 1024px) 56vw, 100vw"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("home.instagram.eyebrow")}
          title={t("home.instagram.title")}
          description={getInstagramHandle(settings.instagram) || settings.storeName}
        />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {galleryImages.map((image) => (
            <BoutiqueImage
              key={image.src}
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
