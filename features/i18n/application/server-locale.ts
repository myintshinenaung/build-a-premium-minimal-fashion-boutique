import { cookies } from "next/headers";
import { defaultLocale } from "@/features/i18n/domain/config";
import { LOCALE_COOKIE, parseLocale } from "@/features/i18n/infrastructure/locale-cookie";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  return parseLocale(stored ?? defaultLocale);
}
