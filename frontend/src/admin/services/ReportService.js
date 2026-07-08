// ================================================================
// FUOTUOKE Campus Eats — Admin Report Service (Memory Statistics Processor)
// ================================================================

export class ReportService {
  static getPlatformStats(orders = [], users = [], menuItems = []) {
    const totalRevenue = orders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
    const activeOrders = orders.filter(o => o.status !== "Completed" && o.status !== "Cancelled").length;
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
