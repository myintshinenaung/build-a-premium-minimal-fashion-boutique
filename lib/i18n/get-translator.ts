import { cache } from "react";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { enMessages } from "@/lib/i18n/messages/en";
import type { MessageKey } from "@/lib/i18n/message-keys";
import type { Messages } from "@/lib/i18n/messages/en";
import { myMessages } from "@/lib/i18n/messages/my";

const catalogs: Record<Locale, Messages> = {
  en: enMessages,
  my: myMessages
};

function resolveMessage(messages: Messages, key: string): string | undefined {
  return key.split(".").reduce<unknown>((value, segment) => {
    if (value && typeof value === "object" && segment in value) {
      return (value as Record<string, unknown>)[segment];
    }

    return undefined;
  }, messages) as string | undefined;
}

function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

export function createTranslator(locale: Locale = defaultLocale) {
  const messages = catalogs[locale];

  function t(key: MessageKey, values?: Record<string, string | number>): string {
    const template = resolveMessage(messages, key) ?? resolveMessage(enMessages, key) ?? key;
    return interpolate(template, values);
  }

  return { t, locale, messages };
}

export type Translator = ReturnType<typeof createTranslator>;
