import { cache } from "react";
import { createTranslator } from "@/lib/i18n/get-translator";
import { getRequestLocale } from "@/lib/i18n/server-locale";

export const getTranslator = cache(async () => {
  const locale = await getRequestLocale();
  return createTranslator(locale);
});
