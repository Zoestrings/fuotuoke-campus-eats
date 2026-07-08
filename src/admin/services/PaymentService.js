// ================================================================
// FUOTUOKE Campus Eats — Admin Payment Service (Production API-backed)
// ================================================================

import { get, del, put } from "../../shared/api/apiClient";

export class PaymentService {
  static async getPayments() {
    return get("/payments");
  }

  static async updatePayment(id, updatedFields) {
    return put(`/payments/${id}`, updatedFields);
  }

  static async deletePayment(id) {
    await del(`/payments/${id}`);
    return 1;
  }
}
