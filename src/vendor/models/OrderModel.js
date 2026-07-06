export class OrderModel {
  static advanceStatus(currentStatus, type) {
    if (!currentStatus || currentStatus === "Received") return "Preparing";
    if (currentStatus === "Preparing") return type === "pickup" ? "Ready for Pickup" : "Out for Delivery";
    return "Completed";
  }
}
