import { cookies } from "next/headers";
import { defaultLocale } from "@/lib/i18n/config";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/locale-cookie";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  return parseLocale(stored ?? defaultLocale);
}
