// ================================================================
// FUOTUOKE Campus Eats — Admin User Service (Production API-backed)
// ================================================================

import { get, patch, del, put, post } from "../../shared/api/apiClient";

export class UserService {
  static async getAll() {
    return get("/users");
  }

  static async toggleStatus(id, currentStatus) {
    const data = await patch(`/users/${id}/status`);
    return data.newStatus;
  }

  static async deleteUser(id) {
    await del(`/users/${id}`);
    return 1;
  }

  static async saveUser(id, userData) {
    await put(`/users/${id}`, userData);
    return { success: true };
  }

  static async addUser(userData) {
    return post("/users", userData);
  }
}
