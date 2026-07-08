// ================================================================
// FUOTUOKE Campus Eats — Customer Order Service (Production API-backed)
// ================================================================

import { get, post, patch } from "../../shared/api/apiClient";

export class OrderService {
  static async getCustomerOrders(customerId) {
    return get("/orders");
  }

  static async placeOrder(orderData) {
    const data = await post("/orders", orderData);
    return data.order || data;
  }

  static async getOrderById(orderId) {
    return get(`/orders/${orderId}`);
  }

  static async submitOrderReview(orderId, rating, review) {
    return patch(`/orders/${orderId}/review`, { rating, review });
  }
}
