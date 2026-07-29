import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildStorefrontContactLinks, formatStoreAddress, getGoogleMapEmbedUrl } from "@/lib/storefront/contact-links";
import { STOREFRONT_DISPLAY_NAME } from "@/lib/storefront/brand";
import { buildPageMetadata, getStoreSettings } from "@/features/settings/server";

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

  return buildPageMetadata({ ...settings, storeName: STOREFRONT_DISPLAY_NAME }, {
    title: "Contact",
    description: `Visit or contact ${STOREFRONT_DISPLAY_NAME} by phone, email, and store location.`
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
          title="Visit Daily Outfit"
          description={`For availability, styling questions, or reserved fittings, contact ${STOREFRONT_DISPLAY_NAME} directly.`}
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
            <MarketplaceImage
              src="/images/store-interior.png"
              alt={`${STOREFRONT_DISPLAY_NAME} store interior`}
              className="aspect-[16/10] rounded-[2px]"
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
            {mapEmbedUrl ? (
              <iframe
                title={`Google Map for ${STOREFRONT_DISPLAY_NAME}`}
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

