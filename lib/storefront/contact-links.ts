import type { StorefrontContactLink, StorefrontSettings } from "@/types/storefront";

function normalizePhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function displayUrl(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function buildStorefrontContactLinks(settings: StorefrontSettings): StorefrontContactLink[] {
  const links: StorefrontContactLink[] = [];

  if (settings.phone) {
    links.push({
      id: "phone",
      label: "Phone",
      value: settings.phone,
      href: normalizePhoneHref(settings.phone),
      external: false
    });
  }

  if (settings.email) {
    links.push({
      id: "email",
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
      external: false
    });
  }

  if (settings.facebook) {
    links.push({
      id: "facebook",
      label: "Facebook",
      value: displayUrl(settings.facebook),
      href: settings.facebook,
      external: true
    });
  }

  if (settings.instagram) {
    links.push({
      id: "instagram",
      label: "Instagram",
      value: displayUrl(settings.instagram),
      href: settings.instagram,
      external: true
    });
  }

  if (settings.telegram) {
    links.push({
      id: "telegram",
      label: "Telegram",
      value: displayUrl(settings.telegram),
      href: settings.telegram,
      external: true
    });
  }

  if (settings.tiktok) {
    links.push({
      id: "tiktok",
      label: "TikTok",
      value: displayUrl(settings.tiktok),
      href: settings.tiktok,
      external: true
    });
  }

  if (settings.messenger) {
    links.push({
      id: "messenger",
      label: "Messenger",
      value: displayUrl(settings.messenger),
      href: settings.messenger,
      external: true
    });
  }

  if (settings.viber) {
    links.push({
      id: "viber",
      label: "Viber",
      value: "Open Viber chat",
      href: settings.viber,
      external: false
    });
  }

  return links;
}

export function getGoogleMapEmbedUrl(googleMap: string) {
  const value = googleMap.trim();

  if (!value) {
    return null;
  }

  if (value.includes("output=embed")) {
    return value;
  }

  if (value.includes("google.com/maps")) {
    return `${value}${value.includes("?") ? "&" : "?"}output=embed`;
  }

  return null;
}

export function formatStoreAddress(address: string) {
  return address
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
