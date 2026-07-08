// ================================================================
// FUOTUOKE Campus Eats — Vendor Order Service (Production API-backed)
// ================================================================

import { get, patch } from "../../shared/api/apiClient";

export class OrderService {
  static async getOrders() {
    return get("/orders");
  }

  static async getAllOrders() {
    return get("/orders");
  }

  static async updateOrderStatus(orderId, status) {
    const data = await patch(`/orders/${orderId}/status`, { status });
    return data.success ? 1 : 0;
  }
}
