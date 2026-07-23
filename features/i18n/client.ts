/** Client-safe i18n exports (no `next/headers`). */
export { TranslatorProvider, useTranslator } from "@/features/i18n/application/use-translator";
export { createTranslator, type Translator } from "@/features/i18n/application/get-translator";

export { resolveCmsContent } from "@/features/i18n/domain/cms-content";
export { defaultLocale, isLocale, locales, type Locale } from "@/features/i18n/domain/config";
export type { MessageKey } from "@/features/i18n/domain/message-keys";

export { LOCALE_COOKIE, LOCALE_STORAGE_KEY, parseLocale, writeLocaleCookie } from "@/features/i18n/infrastructure/locale-cookie";
export { useLocaleStore } from "@/features/i18n/infrastructure/locale-store";

export { DocumentLang } from "@/features/i18n/ui/DocumentLang";
export { LanguageSwitcher } from "@/features/i18n/ui/LanguageSwitcher";
export { LocaleProvider, useLocaleSwitcher } from "@/features/i18n/ui/LocaleProvider";
