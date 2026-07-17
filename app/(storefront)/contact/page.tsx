import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit or contact Atelier Lune by phone, email, Messenger, Viber, Facebook, and Google Map."
};

const contacts = [
  { icon: Phone, label: "Phone", value: "+1 555 014 6771", href: "tel:+15550146771" },
  { icon: Mail, label: "Email", value: "hello@atelierlune.example", href: "mailto:hello@atelierlune.example" },
  { icon: ExternalLink, label: "Facebook", value: "facebook.com/atelierlune", href: "https://facebook.com" },
  { icon: MessageCircle, label: "Messenger", value: "m.me/atelierlune", href: "https://m.me/atelierlune" },
  { icon: Send, label: "Viber", value: "Open Viber chat", href: "viber://chat?number=%2B15550146771" }
];

export default function ContactPage() {
  return (
    <>
      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Contact"
          title="Visit the boutique"
          description="For availability, styling questions, or reserved fittings, contact the store directly."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-8">
            <div className="border-t border-line pt-6">
              <div className="flex items-start gap-3">
                <MapPin size={20} strokeWidth={1.6} className="mt-1 text-ink" />
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">Store location</h2>
                  <p className="mt-3 text-sm leading-6 text-stone">
                    Atelier Lune Flagship
                    <br />
                    24 Garosu-gil, Gangnam-gu
                    <br />
                    Seoul, South Korea
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {contacts.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
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
              alt="Atelier Lune store interior"
              className="aspect-[16/10] rounded-[2px]"
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
            <iframe
              title="Google Map for Atelier Lune"
              src="https://www.google.com/maps?q=Garosu-gil%2C%20Gangnam-gu%2C%20Seoul&output=embed"
              className="h-[380px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
