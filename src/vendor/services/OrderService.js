// ================================================================
// FUOTUOKE Campus Eats — Vendor Order Service (API-backed with fallback)
// ================================================================

import { get, patch } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class OrderService {
  static async getOrders() {
    let apiOrders = [];
    try {
      apiOrders = await get("/orders");
    } catch (error) {
      console.warn("API getOrders failed, using local fallback merge:", error.message);
    }
    const localOrders = db.getCollection("orders") || [];
    
    // Merge API orders and local orders by ID to ensure all orders are visible to vendors
    const mergedMap = new Map();
    localOrders.forEach(o => mergedMap.set(o.id, o));
    if (Array.isArray(apiOrders)) {
      apiOrders.forEach(o => mergedMap.set(o.id, o));
    }
    return Array.from(mergedMap.values());
  }

  static async getAllOrders() {
    return this.getOrders();
  }

  static async updateOrderStatus(orderId, status) {
    try {
      const data = await patch(`/orders/${orderId}/status`, { status });
      // Keep local DB updated too
      try {
        db.update("orders", { id: orderId }, { status });
      } catch (e) {}
      return data.success ? 1 : 0;
    } catch (error) {
      console.warn("API updateOrderStatus failed, falling back to local DB:", error.message);
      db.update("orders", { id: orderId }, { status });
      return 1;
    }
  }
}
