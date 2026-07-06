// ================================================================
// FUOTUOKE Campus Eats — Customer Order Service (API-backed with fallback)
// ================================================================

import { get, post, patch } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class OrderService {
  static async getCustomerOrders(customerId) {
    let apiOrders = [];
    try {
      apiOrders = await get("/orders");
    } catch (error) {
      console.warn("API getCustomerOrders failed, using local fallback merge:", error.message);
    }
    const localOrders = db.find("orders", { customerId }) || [];
    
    // Merge API orders and local orders by ID to ensure all orders placed are visible
    const mergedMap = new Map();
    localOrders.forEach(o => mergedMap.set(o.id, o));
    if (Array.isArray(apiOrders)) {
      apiOrders.forEach(o => {
        if (o.customerId === customerId) {
          mergedMap.set(o.id, o);
        }
      });
    }
    return Array.from(mergedMap.values());
  }

  static async placeOrder(orderData) {
    try {
      const data = await post("/orders", orderData);
      // Try to save to local storage as backup too
      try {
        db.insert("orders", orderData);
      } catch (e) {}
      return data.order || data;
    } catch (error) {
      console.warn("API placeOrder failed, falling back to local DB:", error.message);
      return db.insert("orders", orderData);
    }
  }

  static async getOrderById(orderId) {
    try {
      return await get(`/orders/${orderId}`);
    } catch (error) {
      console.warn("API getOrderById failed, falling back to local DB:", error.message);
      return db.findOne("orders", { id: orderId });
    }
  }

  static async submitOrderReview(orderId, rating, review) {
    try {
      const data = await patch(`/orders/${orderId}/review`, { rating, review });
      try {
        db.update("orders", { id: orderId }, { rating: Number(rating), review: (review || "").trim() });
      } catch (e) {}
      return data;
    } catch (error) {
      console.warn("API submitOrderReview failed, falling back to local DB:", error.message);
      db.update("orders", { id: orderId }, { rating: Number(rating), review: (review || "").trim() });
      return { success: true };
    }
  }
}
