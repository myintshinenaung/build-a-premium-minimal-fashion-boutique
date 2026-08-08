"use client";

import { useState } from "react";
import type { CustomerProfile } from "@/types/account";
import { locales, type Locale } from "@/features/i18n/domain/config";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-novora-border bg-white px-4 text-sm text-novora-ink outline-none transition-colors placeholder:text-novora-muted focus:border-novora-ink";

type ProfileFormProps = {
  profile: CustomerProfile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
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
          name,
          phone,
          email,
          avatarUrl,
          preferredLanguage
        })
      });
      const payload = (await response.json()) as { message?: string; profile?: CustomerProfile };

      if (!response.ok) {
        setError(payload.message ?? "Unable to update profile.");
        return;
      }

      setMessage("Profile updated.");
      if (payload.profile) {
        setName(payload.profile.name);
        setPhone(payload.profile.phone);
        setEmail(payload.profile.email);
        setAvatarUrl(payload.profile.avatarUrl);
        setPreferredLanguage(payload.profile.preferredLanguage);
      }
    } catch {
      setError("Unable to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4 rounded-3xl border border-novora-border bg-white p-5 sm:p-6" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Name</span>
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Phone</span>
        <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} required />
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Email</span>
        <input
          className={inputClass}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-novora-muted">Avatar URL</span>
        <input
          className={inputClass}
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          placeholder="Optional"
        />
      </label>
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

      {error ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{error}</p> : null}
      {message ? <p className="rounded-2xl bg-novora-surface px-4 py-3 text-sm text-novora-ink">{message}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-novora-ink text-sm font-medium text-white transition-colors hover:bg-novora-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
