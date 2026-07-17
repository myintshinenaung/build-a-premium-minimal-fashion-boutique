import type { Metadata } from "next";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Atelier Lune, a premium minimal fashion boutique built around a quiet, edited wardrobe."
};

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">Brand story</p>
          <h1 className="mt-4 text-4xl font-medium leading-tight text-ink md:text-6xl">Quiet pieces. Precise intent.</h1>
          <p className="mt-6 text-sm leading-7 text-stone md:text-base">
            Atelier Lune began as a small boutique for women who wanted fewer decisions and better proportions. Each
            collection is built around calm neutrals, disciplined silhouettes, and fabrics that feel considered up close.
          </p>
        </div>
        <BoutiqueImage
          src="/images/store-interior.png"
          alt="Atelier Lune boutique interior"
          className="aspect-[16/9] rounded-[2px]"
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
        />
      </section>

      <section className="bg-mist py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            ["01", "Edited", "We make room for fewer, stronger pieces instead of seasonal noise."],
            ["02", "Tactile", "Texture, weight, and drape guide every selection before trend or novelty."],
            ["03", "Wearable", "Every item has to move easily through work, travel, dinner, and repetition."]
          ].map(([number, title, text]) => (
            <div key={number} className="border-t border-line pt-6">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">{number}</p>
              <h2 className="mt-4 text-2xl font-medium text-ink">{title}</h2>
              <p className="mt-4 text-sm leading-6 text-stone">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Mission"
          title="Make the wardrobe feel calm before it feels full."
          description="We source and style with longevity in mind: neutral shades, clear shapes, and repeatable combinations that hold up after the first impression."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <BoutiqueImage
            src="/images/new-collection.png"
            alt="Atelier Lune tailored collection"
            className="aspect-[16/10] rounded-[2px]"
            sizes="(min-width: 768px) 56vw, 100vw"
          />
          <BoutiqueImage
            src="/images/ivory-dress.png"
            alt="Ivory midi dress in studio"
            className="aspect-[4/5] rounded-[2px]"
            sizes="(min-width: 768px) 44vw, 100vw"
          />
        </div>
      </section>
    </>
  );
}
