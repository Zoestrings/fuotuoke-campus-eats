// ================================================================
// FUOTUOKE Campus Eats — Admin Auth Service (API-backed)
// ================================================================

import { post, setTokens, clearTokens } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class AuthService {
  static async login(id, password) {
    try {
      const data = await post("/auth/login", { id, password, role: "admin" });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("fuo_admin_session", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.warn("API login failed, falling back to local DB:", error.message);
      const user = db.findOne("users", { id: id.trim(), role: "admin" });
      if (!user) {
        return { success: false, error: "Admin account not found. Please check your username." };
      }
      if (user.status !== "active") {
        return { success: false, error: "This admin account has been suspended." };
      }
      if (user.password !== password) {
        return { success: false, error: "Incorrect password. Please try again." };
      }
      localStorage.setItem("fuo_admin_session", JSON.stringify(user));
      return { success: true, user };
    }
  }

  static signup() {
    return { success: false, error: "Admin registration is disabled." };
  }

  static getSession() {
    const data = localStorage.getItem("fuo_admin_session");
    return data ? JSON.parse(data) : null;
  }

  static logout() {
    clearTokens();
    localStorage.removeItem("fuo_admin_session");
  }
}
