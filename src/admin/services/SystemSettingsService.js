// ================================================================
// FUOTUOKE Campus Eats — Admin System Settings Service (API-backed)
// ================================================================

import { get, put } from "../../shared/api/apiClient";

export class SystemSettingsService {
  static async getSettings() {
    try {
      return await get("/settings");
    } catch (error) {
      console.error("Failed to fetch settings:", error.message);
      // Return defaults on error
      return {
        maintenanceMode: false,
        allowRegistration: true,
        allowDeliveries: true,
        deliveryFee: 500,
        supportPhone: "080-3333-4444"
      };
    }
  }

  static async saveSettings(settings) {
    try {
      const data = await put("/settings", settings);
      return data.settings || settings;
    } catch (error) {
      console.error("Failed to save settings:", error.message);
      throw error;
    }
  }

  static resetDatabase() {
    // Database reset is now handled server-side; this clears client state only
    localStorage.clear();
    return true;
  }
}
