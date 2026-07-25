import { settingsRepository, type SettingsUpdateInput } from "@/features/settings/infrastructure/settings-repository";

export type { SettingsUpdateInput };

export const settingsService = {
  getSettings() {
    return settingsRepository.get();
  },

  updateSettings(input: SettingsUpdateInput) {
    return settingsRepository.update(input);
  }
};
