/** Server-only i18n exports (`next/headers`). Import only from Server Components / route handlers. */
export { getTranslator } from "@/features/i18n/application/server-translator";
export { getRequestLocale } from "@/features/i18n/application/server-locale";

export { createTranslator, type Translator } from "@/features/i18n/application/get-translator";
export { defaultLocale, isLocale, locales, type Locale } from "@/features/i18n/domain/config";
export { resolveCmsContent } from "@/features/i18n/domain/cms-content";
