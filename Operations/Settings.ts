import { storage } from "@/storage/mmkv";

class SettingsProperties {
  static setEnableNotifications(value: boolean) {
    const currentSettings = this.getSettings();
    const updatedSettings = {
      ...currentSettings,
      enableNotifications: value
    };

    storage.set('userSettings', JSON.stringify(updatedSettings));
  }

  static setDarkMode(value: boolean) {
    const currentSettings = this.getSettings();
    const updatedSettings = {
      ...currentSettings,
      darkMode: value
    };

    console.log("SettingsProperties - Updating darkMode to:", value);

    storage.set('userSettings', JSON.stringify(updatedSettings));
  }

  static getSettings() {
    const settingsString = storage.getString('userSettings');
    if (settingsString) {
      return JSON.parse(settingsString);
    } else {
      // Return default settings if none are stored
      return {
        enableNotifications: false,
        darkMode: false
      };
    }
  }
}

export { SettingsProperties };
