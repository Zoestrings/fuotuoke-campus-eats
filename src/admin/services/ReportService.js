import { db } from "../../shared/database/db";

export class ReportService {
  static getPlatformStats(customOrders, customUsers, customMenuItems) {
    const orders = customOrders || db.getCollection("orders") || [];
    const users = customUsers || db.getCollection("users") || [];
    const menuItems = customMenuItems || db.getCollection("menuItems") || [];

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const activeOrders = orders.filter(o => o.status !== "Completed").length;
    const completedOrders = orders.filter(o => o.status === "Completed").length;

    return {
      totalRevenue,
      activeOrders,
      completedOrders,
      userCount: users.length,
      menuCount: menuItems.length,
      ordersCount: orders.length
    };
  }
}
