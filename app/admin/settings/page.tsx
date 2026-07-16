import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/forms/SettingsForm";
import { settingsService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Settings"
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const storeSettings = await settingsService.getSettings();

  return <SettingsForm initialSettings={storeSettings} />;
}
