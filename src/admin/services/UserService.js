// ================================================================
// FUOTUOKE Campus Eats — Admin User Service (API-backed with fallback)
// ================================================================

import { get, patch, del, put, post } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class UserService {
  static async getAll() {
    let apiUsers = [];
    try {
      apiUsers = await get("/users");
    } catch (error) {
      console.warn("API getAll users failed, using local fallback merge:", error.message);
    }
    const localUsers = db.getCollection("users") || [];
    
    // Merge backend API users and frontend local storage users by ID to ensure all accounts show
    const mergedMap = new Map();
    localUsers.forEach(u => mergedMap.set(u.id.toUpperCase(), u));
    if (Array.isArray(apiUsers)) {
      apiUsers.forEach(u => mergedMap.set(u.id.toUpperCase(), u));
    }
    
    return Array.from(mergedMap.values());
  }

  static async toggleStatus(id, currentStatus) {
    let nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const data = await patch(`/users/${id}/status`);
      nextStatus = data.newStatus;
    } catch (error) {
      console.warn("API toggleStatus failed, falling back to local DB:", error.message);
    }
    const user = db.findOne("users", { id });
    if (user) {
      db.update("users", { id }, { status: nextStatus });
    }
    return nextStatus;
  }

  static async deleteUser(id) {
    try {
      await del(`/users/${id}`);
    } catch (error) {
      console.warn("API deleteUser failed, falling back to local DB:", error.message);
    }
    db.delete("users", { id });
    return 1;
  }

  static async saveUser(id, userData) {
    try {
      await put(`/users/${id}`, userData);
    } catch (error) {
      console.warn("API saveUser failed, falling back to local DB:", error.message);
    }
    db.update("users", { id }, userData);
    return { success: true };
  }

  static async addUser(userData) {
    try {
      await post("/users", userData);
    } catch (error) {
      console.warn("API addUser failed, falling back to local DB:", error.message);
    }
    const exists = db.findOne("users", { id: userData.id.toUpperCase() });
    if (exists) {
      throw new Error("An account with this ID already exists.");
    }
    const newUser = db.insert("users", {
      ...userData,
      id: userData.id.toUpperCase(),
      status: "active",
      createdAt: new Date().toLocaleDateString()
    });
    return newUser;
  }
}
