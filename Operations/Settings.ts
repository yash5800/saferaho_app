import { storage } from "@/storage/mmkv";

type themes = "light" | "dark" | "system";

type UserSettings = {
  enableNotifications: boolean;
  themeMode: themes;
};

class SettingsProperties {
  static getSettings(): UserSettings {
    const settingsString = storage.getString("userSettings");
    console.log("SettingsProperties - Retrieved settings:", settingsString);
    if (settingsString) {
      return JSON.parse(settingsString);
    } else {
      // Return default settings if none are stored
      return {
        enableNotifications: false,
        themeMode: "system",
      };
    }
  }

  static settheme(value: themes) {
    const currentSettings = this.getSettings();
    const updatedSettings: UserSettings = {
      ...currentSettings,
      themeMode: value,
    };

    console.log("SettingsProperties - Updating themeMode to:", value);

    storage.set("userSettings", JSON.stringify(updatedSettings));
  }

  static setEnableNotifications(value: boolean) {
    const currentSettings = this.getSettings();
    storage.set(
      "userSettings",
      JSON.stringify({
        ...currentSettings,
        enableNotifications: value,
      }),
    );
  }
}

export { SettingsProperties, themes, UserSettings };
