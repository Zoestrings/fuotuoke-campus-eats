// ================================================================
// FUOTUOKE Campus Eats — Admin Audit Log Service (API-backed)
// ================================================================

import { get, post } from "../../shared/api/apiClient";

export class AuditLogService {
  static async getLogs() {
    try {
      return await get("/audit");
    } catch (error) {
      console.error("Failed to fetch audit logs:", error.message);
      return [];
    }
  }

  static async logAction(user, action) {
    try {
      await post("/audit", { action });
    } catch (error) {
      console.error("Failed to log action:", error.message);
    }
  }
}
