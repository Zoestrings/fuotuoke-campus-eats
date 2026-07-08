export class OrderModel {
  static create({ items, total, outlet, type, faculty, customerId, customerName }) {
    return {
      id: Date.now(),
      items,
      total,
      outlet,
      type, // 'pickup' or 'delivery'
      faculty: type === "delivery" ? faculty : null,
      status: "Received",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      customerId,
      customerName
    };
  }

  static validate(order) {
    if (!order.items || order.items.length === 0) return { valid: false, error: "Your cart is empty." };
    if (!order.outlet || !order.outlet.name) return { valid: false, error: "Please select a canteen." };
    if (order.type === "delivery" && !order.faculty) return { valid: false, error: "Please select a faculty for delivery." };
    return { valid: true };
  }
}
