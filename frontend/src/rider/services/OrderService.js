// ================================================================
// FUOTUOKE Campus Eats — Rider Order Service (Production-grade API-backed)
// ================================================================

import { get, patch } from "../../shared/api/apiClient";

export class OrderService {
  static async getRiderOrders() {
    return get("/orders");
  }

  static async acceptDelivery(orderId, riderPhone) {
    return patch(`/orders/${orderId}/accept-delivery`, { phone: riderPhone });
  }

  static async updateDeliveryProgress(orderId, progress) {
    return patch(`/orders/${orderId}/delivery-progress`, { progress });
  }

  static async completeDelivery(orderId) {
    return patch(`/orders/${orderId}/complete-delivery`);
  }

  static async updateRiderLocation(orderId, latitude, longitude) {
    return patch(`/orders/${orderId}/location`, { latitude, longitude });
  }
}
