export class AuditLogModel {
  static create({ user, action, ip = "127.0.0.1" }) {
    return {
      id: Date.now(),
      user,
      action,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString(),
      ip
    };
  }
}
