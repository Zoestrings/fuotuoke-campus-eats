// ================================================================
// FUOTUOKE Campus Eats — Admin Menu Service (API-backed)
// ================================================================

import { get, del } from "../../shared/api/apiClient";

export class MenuService {
  static async getAll() {
    try {
      return await get("/menu");
    } catch (error) {
      console.error("Failed to fetch menu:", error.message);
      return [];
    }
  }

  static async deleteItem(id) {
    try {
      await del(`/menu/${id}`);
      return 1;
    } catch (error) {
      console.error("Failed to delete menu item:", error.message);
      return 0;
    }
  }
}
