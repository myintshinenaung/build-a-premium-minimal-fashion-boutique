"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requestAdminJson } from "@/lib/admin-api-client";
import type { StoreSettings } from "@/types/admin";

const inputClass =
  "w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

const identityFields: Array<keyof StoreSettings> = ["storeName", "logo", "storeDescription"];
const socialFields: Array<keyof StoreSettings> = ["facebook", "messenger", "viber", "telegram", "tiktok", "instagram"];
const contactFields: Array<keyof StoreSettings> = ["email", "phone", "address", "googleMap", "currency", "timezone"];

export function SettingsForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  function updateField(field: keyof StoreSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function saveSettings() {
    try {
      const { settings: savedSettings } = await requestAdminJson<{ settings: StoreSettings }>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(settings)
      });

      setSettings(savedSettings);
      setSaved(true);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save settings.");
    }
  }

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Version 2 store settings for Supabase-backed brand, contact, social, localization, and map configuration."
      />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="border border-line bg-white p-6">
          <p className={labelClass}>Store identity</p>
          <h2 className="mt-3 text-2xl font-medium text-ink">{settings.storeName}</h2>
          <p className="mt-4 text-sm leading-6 text-stone">{settings.storeDescription}</p>
          <dl className="mt-8 space-y-3 text-sm">
            <Detail label="Currency" value={settings.currency} />
            <Detail label="Timezone" value={settings.timezone} />
            <Detail label="Phone" value={settings.phone} />
          </dl>
          {saved ? <p className="mt-6 border border-line bg-mist px-4 py-3 text-sm text-ink">Settings saved.</p> : null}
        </aside>

        <div className="space-y-6">
          <SettingsSection title="Brand" fields={identityFields} settings={settings} onChange={updateField} />
          <SettingsSection title="Social channels" fields={socialFields} settings={settings} onChange={updateField} />
          <SettingsSection title="Contact and localization" fields={contactFields} settings={settings} onChange={updateField} />
          <button
            type="button"
            onClick={saveSettings}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Save size={17} strokeWidth={1.7} />
            Save Settings
          </button>
        </div>
      </div>
    </section>
  );
}

function SettingsSection({
  title,
  fields,
  settings,
  onChange
}: {
  title: string;
  fields: Array<keyof StoreSettings>;
  settings: StoreSettings;
  onChange: (field: keyof StoreSettings, value: string) => void;
}) {
  return (
    <section className="border border-line bg-white p-5">
      <div className="border-b border-line pb-5">
        <p className={labelClass}>{title}</p>
        <h2 className="mt-2 text-xl font-medium text-ink">{title} placeholders</h2>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className={field === "storeDescription" || field === "address" || field === "googleMap" ? "md:col-span-2" : ""}>
            <span className={labelClass}>{labelFor(field)}</span>
            {field === "storeDescription" || field === "address" || field === "googleMap" ? (
              <textarea
                value={settings[field]}
                onChange={(event) => onChange(field, event.target.value)}
                className={`${inputClass} mt-2 min-h-28 resize-y`}
              />
            ) : (
              <input value={settings[field]} onChange={(event) => onChange(field, event.target.value)} className={`${inputClass} mt-2`} />
            )}
          </label>
        ))}
      </div>
    </section>
  );
}

function labelFor(field: keyof StoreSettings) {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
      <dt className="text-stone">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
