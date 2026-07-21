import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildStorefrontContactLinks, formatStoreAddress, getGoogleMapEmbedUrl } from "@/lib/storefront/contact-links";
import { buildPageMetadata } from "@/lib/storefront/metadata";
import { getStoreSettings } from "@/lib/storefront/settings";

const contactIcons = {
  phone: Phone,
  email: Mail,
  facebook: ExternalLink,
  instagram: ExternalLink,
  telegram: Send,
  tiktok: ExternalLink,
  messenger: MessageCircle,
  viber: Send
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return buildPageMetadata(settings, {
    title: "Contact",
    description: `Visit or contact ${settings.storeName} by phone, email, and store location.`
  });
}

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const contactLinks = buildStorefrontContactLinks(settings);
  const addressLines = formatStoreAddress(settings.address);
  const mapEmbedUrl = getGoogleMapEmbedUrl(settings.googleMap);

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Contact"
          title="Visit the boutique"
          description={`For availability, styling questions, or reserved fittings, contact ${settings.storeName} directly.`}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-8">
            <div className="border-t border-line pt-6">
              <div className="flex items-start gap-3">
                <MapPin size={20} strokeWidth={1.6} className="mt-1 text-ink" />
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">Store location</h2>
                  <p className="mt-3 text-sm leading-6 text-stone">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {contactLinks.map((item) => {
                const Icon = contactIcons[item.id as keyof typeof contactIcons] ?? ExternalLink;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="flex items-center justify-between gap-4 border border-line px-4 py-4 text-sm transition-colors hover:border-ink"
                  >
                    <span className="flex items-center gap-3 text-ink">
                      <Icon size={18} strokeWidth={1.6} />
                      {item.label}
                    </span>
                    <span className="text-right text-stone">{item.value}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <BoutiqueImage
              src="/images/store-interior.png"
              alt={`${settings.storeName} store interior`}
              className="aspect-[16/10] rounded-[2px]"
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
            {mapEmbedUrl ? (
              <iframe
                title={`Google Map for ${settings.storeName}`}
                src={mapEmbedUrl}
                className="h-[380px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
