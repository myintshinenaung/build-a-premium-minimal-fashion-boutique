"use client";

import { cn } from "@/lib/utils";
import { useLocaleSwitcher } from "@/components/i18n/LocaleProvider";
import { useLocaleStore } from "@/lib/i18n/locale-store";
import { useTranslator } from "@/lib/i18n/use-translator";

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const { t } = useTranslator();
  const { locale, switchLocale } = useLocaleSwitcher();
  const hasHydrated = useLocaleStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <div className={cn("inline-flex h-10 w-[92px] rounded-full border border-line bg-white", className)} aria-hidden />;
  }

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-line p-1", className)} role="group" aria-label={t("header.language")}>
      {(["my", "en"] as const).map((value) => {
        const active = locale === value;
        const label = value === "my" ? (compact ? "MM" : t("language.myanmar")) : compact ? "EN" : t("language.english");

        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={value === "my" ? t("language.switchToMyanmar") : t("language.switchToEnglish")}
            onClick={() => switchLocale(value)}
            className={cn(
              "inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active ? "bg-ink text-white" : "text-stone hover:text-ink"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
