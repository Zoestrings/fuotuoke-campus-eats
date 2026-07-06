// ================================================================
// FUOTUOKE Campus Eats — Vendor Meal Service (API-backed)
// ================================================================

import { get, post, del, put } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class MealService {
  static async getMeals() {
    try {
      return await get("/menu");
    } catch (error) {
      console.warn("API getMeals failed, falling back to local DB:", error.message);
      return db.getCollection("menuItems");
    }
  }

  static async addMeal(meal) {
    try {
      return await post("/menu", meal);
    } catch (error) {
      console.warn("API addMeal failed, falling back to local DB:", error.message);
      return db.insert("menuItems", meal);
    }
  }

  static async updateMeal(id, updates) {
    try {
      return await put(`/menu/${id}`, updates);
    } catch (error) {
      console.warn("API updateMeal failed, falling back to local DB:", error.message);
      db.update("menuItems", { id }, updates);
      return updates;
    }
  }

  static async deleteMeal(id) {
    try {
      await del(`/menu/${id}`);
      return 1;
    } catch (error) {
      console.warn("API deleteMeal failed, falling back to local DB:", error.message);
      return db.delete("menuItems", { id });
    }
  }

  // Backward compatibility — saveMeals is no longer used with API
  static async saveMeals(meals) {
    console.warn("saveMeals() is deprecated. Use addMeal/updateMeal/deleteMeal instead.");
  }
}
