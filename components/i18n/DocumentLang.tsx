"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/lib/i18n/locale-store";

export function DocumentLang() {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
