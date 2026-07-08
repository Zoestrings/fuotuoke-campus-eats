// ================================================================
// FUOTUOKE Campus Eats — Vendor Meal Service (Production API-backed)
// ================================================================

import { get, post, del, put } from "../../shared/api/apiClient";

export class MealService {
  static async getMeals() {
    return get("/menu");
  }

  static async addMeal(meal) {
    return post("/menu", meal);
  }

  static async updateMeal(id, updates) {
    return put(`/menu/${id}`, updates);
  }

  static async deleteMeal(id) {
    await del(`/menu/${id}`);
    return 1;
  }

  static async saveMeals(meals) {
    console.warn("saveMeals() is deprecated. Use addMeal/updateMeal/deleteMeal instead.");
  }
}
