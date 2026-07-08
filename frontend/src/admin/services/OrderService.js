// ================================================================
// FUOTUOKE Campus Eats — Admin Order Service (Production API-backed)
// ================================================================

import { get, patch, del } from "../../shared/api/apiClient";

export class OrderService {
  static async getAll() {
    return get("/orders");
  }

  static async deleteOrder(id) {
    await del(`/orders/${id}`);
    return 1;
  }

  static async updateStatus(id, status, updatedFields = {}) {
    await patch(`/orders/${id}/status`, { status, ...updatedFields });
    return 1;
  }
}
