// ================================================================
// FUOTUOKE Campus Eats — Admin Vendor Service (API-backed)
// ================================================================

import { get } from "../../shared/api/apiClient";
import { OUTLETS } from "../../data";

export class VendorService {
  static async getVendors() {
    try {
      const users = await get("/users?role=kitchen");
      return users;
    } catch (error) {
      console.error("Failed to fetch vendors:", error.message);
      return [];
    }
  }

  static getOutlets() {
    return OUTLETS;
  }
}
