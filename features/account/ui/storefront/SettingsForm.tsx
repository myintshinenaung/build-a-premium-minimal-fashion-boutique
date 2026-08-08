"use client";

import { useState } from "react";
import type { CustomerProfile } from "@/types/account";
import { locales, type Locale } from "@/features/i18n/domain/config";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-novora-border bg-white px-4 text-sm text-novora-ink outline-none transition-colors focus:border-novora-ink";

type SettingsFormProps = {
  profile: CustomerProfile;
};

export function SettingsForm({ profile }: SettingsFormProps) {
  const [preferredLanguage, setPreferredLanguage] = useState<Locale>(profile.preferredLanguage);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          preferredLanguage
        })
      });
      const payload = (await response.json()) as { message?: string; profile?: CustomerProfile };

      if (!response.ok) {
        setError(payload.message ?? "Unable to update settings.");
        return;
      }

      if (payload.profile) {
        setPreferredLanguage(payload.profile.preferredLanguage);
      }

      setMessage("Settings saved.");
    } catch {
      setError("Unable to update settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4 rounded-3xl border border-novora-border bg-white p-5 sm:p-6" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Preferred language</span>
        <select
          className={inputClass}
          value={preferredLanguage}
          onChange={(event) => setPreferredLanguage(event.target.value as Locale)}
        >
          {locales.map((locale) => (
            <option key={locale} value={locale}>
              {locale === "my" ? "Myanmar" : "English"}
            </option>
          ))}
        </select>
      </label>

      <p className="text-sm leading-6 text-novora-muted">
        Profile details can be edited under Profile. Notification preferences will arrive in a later sprint.
      </p>

      {error ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{error}</p> : null}
      {message ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{message}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-novora-ink text-sm font-medium text-white disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
