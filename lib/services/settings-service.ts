import { settingsRepository, type SettingsUpdateInput } from "@/lib/repositories/settings-repository";

export const settingsService = {
  getSettings() {
    return settingsRepository.get();
  },

  updateSettings(input: SettingsUpdateInput) {
    return settingsRepository.update(input);
  }
};
