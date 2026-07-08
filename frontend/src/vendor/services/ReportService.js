export class ReportService {
  static getStats(orders) {
    const totalRevenue = orders.reduce((s, o) => s + (o.status === "Completed" ? o.total : 0), 0);
    const activeOrders = orders.filter(o => o.status !== "Completed");
    const completedOrders = orders.filter(o => o.status === "Completed");

    const itemCounts = {};
    orders.forEach(o => o.items.forEach(i => {
      const base = i.name.split(" (")[0];
      itemCounts[base] = (itemCounts[base] || 0) + i.qty;
    }));

    const topSelling = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalRevenue,
      activeCount: activeOrders.length,
      completedCount: completedOrders.length,
      topSelling
    };
  }
}
