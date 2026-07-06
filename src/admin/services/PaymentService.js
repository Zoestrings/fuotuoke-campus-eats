// ================================================================
// FUOTUOKE Campus Eats — Admin Payment Service (API-backed with fallback)
// ================================================================

import { get, patch, del, put } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class PaymentService {
  static async getPayments() {
    try {
      return await get("/payments");
    } catch (error) {
      console.warn("API getPayments failed, falling back to local DB orders:", error.message);
      // Check if local payments collection exists
      const payments = db.getCollection("payments");
      if (payments && payments.length > 0) {
        return payments;
      }

      // If not, dynamically build from orders
      const orders = db.getCollection("orders");
      const mapped = orders.map(order => ({
        id: `TXN_${order.id}`,
        orderId: order.id,
        customer: order.customerName || "Precious Daniel",
        method: order.paymentMethod || "Credit Card",
        amount: order.total,
        status: order.status === "Cancelled" ? "Failed" : "Successful",
        time: order.time || "12:00 PM"
      }));

      // Cache it in local database
      db.saveCollection("payments", mapped);
      return mapped;
    }
  }

  static async updatePayment(id, updatedFields) {
    try {
      return await put(`/payments/${id}`, updatedFields);
    } catch (error) {
      console.warn("API updatePayment failed, falling back to local DB:", error.message);
      db.update("payments", { id }, updatedFields);
      return { success: true };
    }
  }

  static async deletePayment(id) {
    try {
      await del(`/payments/${id}`);
      return 1;
    } catch (error) {
      console.warn("API deletePayment failed, falling back to local DB:", error.message);
      db.delete("payments", { id });
      return 1;
    }
  }
}
