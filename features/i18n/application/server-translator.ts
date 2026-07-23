import { cache } from "react";
import { createTranslator } from "@/features/i18n/application/get-translator";
import { getRequestLocale } from "@/features/i18n/application/server-locale";

export const getTranslator = cache(async () => {
  const locale = await getRequestLocale();
  return createTranslator(locale);
});
