// ================================================================
// FUOTUOKE Campus Eats — Admin Order Service (API-backed with fallback)
// ================================================================

import { get, patch, del } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class OrderService {
  static async getAll() {
    let apiOrders = [];
    try {
      apiOrders = await get("/orders");
    } catch (error) {
      console.warn("API getAll orders failed, using local fallback merge:", error.message);
    }
    const localOrders = db.getCollection("orders") || [];
    
    // Merge backend API orders and frontend local storage orders by ID to ensure all orders show
    const mergedMap = new Map();
    localOrders.forEach(o => mergedMap.set(o.id, o));
    if (Array.isArray(apiOrders)) {
      apiOrders.forEach(o => mergedMap.set(o.id, o));
    }
    
    return Array.from(mergedMap.values());
  }

  static async deleteOrder(id) {
    try {
      await del(`/orders/${id}`);
    } catch (error) {
      console.warn("API deleteOrder failed, falling back to local DB:", error.message);
    }
    db.delete("orders", { id });
    return 1;
  }

  static async updateStatus(id, status, updatedFields = {}) {
    try {
      await patch(`/orders/${id}/status`, { status, ...updatedFields });
    } catch (error) {
      console.warn("API updateStatus failed, falling back to local DB:", error.message);
    }
    db.update("orders", { id }, { status, ...updatedFields });
    return 1;
  }
}
