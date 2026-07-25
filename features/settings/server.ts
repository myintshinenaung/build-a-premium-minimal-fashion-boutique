/** Server-only settings exports. Import from Server Components, route handlers, and server actions. */
export { getStoreSettings } from "@/features/settings/application/settings";
export { buildPageMetadata, buildRootStorefrontMetadata } from "@/features/settings/application/metadata";
export { settingsService } from "@/features/settings/application/settings-service";
export { mapStoreSettingsToStorefront } from "@/features/settings/domain/map-settings";
export { defaultAdminHeroSettings, defaultStorefrontSettings } from "@/features/settings/domain/defaults";
export {
  settingsRepository,
  type SettingsUpdateInput
} from "@/features/settings/infrastructure/settings-repository";
