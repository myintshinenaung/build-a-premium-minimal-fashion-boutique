import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/storefront/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl())
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
