// ================================================================
// FUOTUOKE Campus Eats — Rider Order Service
// ================================================================

import { get, patch } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class OrderService {
  static async getRiderOrders() {
    try {
      return await get("/orders");
    } catch (error) {
      console.warn("API getRiderOrders failed, using local DB filter:", error.message);
      const sessionStr = localStorage.getItem("fuo_session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      if (!session) return [];
      
      const allOrders = db.find("orders", {}) || [];
      return allOrders.filter(o => 
        (o.type === "delivery" && ["Preparing", "Ready"].includes(o.status) && !o.assignedRiderId) ||
        (o.assignedRiderId === session.id || o.assignedRiderId === session.userId)
      );
    }
  }

  static async acceptDelivery(orderId, riderPhone) {
    try {
      const data = await patch(`/orders/${orderId}/accept-delivery`, { phone: riderPhone });
      try {
        const sessionStr = localStorage.getItem("fuo_session");
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        if (session) {
          db.update("orders", { id: orderId }, {
            assignedRiderId: session.userId,
            assignedRiderName: session.name,
            assignedRiderPhone: riderPhone || "08012345678",
            status: "Out for Delivery"
          });
        }
      } catch (e) {}
      return data;
    } catch (error) {
      console.warn("API acceptDelivery failed, updating local DB:", error.message);
      const sessionStr = localStorage.getItem("fuo_session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      if (!session) throw new Error("No active session");

      const order = db.findOne("orders", { id: orderId });
      if (!order) throw new Error("Order not found");
      if (order.assignedRiderId) throw new Error("Already accepted by another rider");

      return db.update("orders", { id: orderId }, {
        assignedRiderId: session.userId,
        assignedRiderName: session.name,
        assignedRiderPhone: riderPhone || "08012345678",
        status: "Out for Delivery"
      });
    }
  }

  static async updateDeliveryProgress(orderId, progress) {
    try {
      const data = await patch(`/orders/${orderId}/delivery-progress`, { progress });
      try {
        db.update("orders", { id: orderId }, { deliveryProgress: Number(progress) });
      } catch (e) {}
      return data;
    } catch (error) {
      console.warn("API updateDeliveryProgress failed, updating local DB:", error.message);
      return db.update("orders", { id: orderId }, { deliveryProgress: Number(progress) });
    }
  }

  static async completeDelivery(orderId) {
    try {
      const data = await patch(`/orders/${orderId}/complete-delivery`);
      try {
        db.update("orders", { id: orderId }, { status: "Completed" });
      } catch (e) {}
      return data;
    } catch (error) {
      console.warn("API completeDelivery failed, updating local DB:", error.message);
      const order = db.findOne("orders", { id: orderId });
      if (!order) throw new Error("Order not found");

      return db.update("orders", { id: orderId }, { status: "Completed" });
    }
  }
}
