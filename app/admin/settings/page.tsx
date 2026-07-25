import type { Metadata } from "next";
import { SettingsForm } from "@/features/settings/client";
import { settingsService } from "@/features/settings/server";

export const metadata: Metadata = {
  title: "Settings"
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const storeSettings = await settingsService.getSettings();

  return <SettingsForm initialSettings={storeSettings} />;
}
