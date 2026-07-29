import type { Metadata } from "next";
import "./globals.css";
import { defaultLocale } from "@/features/i18n/domain/config";
import { getSiteUrl } from "@/lib/storefront/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl())
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
