import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://atelier-lune.example"),
  title: {
    default: "Atelier Lune | Premium Minimal Fashion Boutique",
    template: "%s | Atelier Lune"
  },
  description:
    "Atelier Lune is a premium minimal fashion boutique offering refined dresses, tailoring, denim, shoes, bags, and accessories.",
  keywords: ["fashion boutique", "minimal fashion", "premium clothing", "dresses", "tailoring", "accessories"],
  openGraph: {
    title: "Atelier Lune",
    description: "Premium minimal fashion for a quiet, edited wardrobe.",
    url: "https://atelier-lune.example",
    siteName: "Atelier Lune",
    images: [
      {
        url: "/images/hero-boutique.png",
        width: 1920,
        height: 800,
        alt: "Atelier Lune boutique editorial"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
