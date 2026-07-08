// ================================================================
// FUOTUOKE Campus Eats — Vendor Auth Service (Production-ready API-backed)
// ================================================================

import { post, setTokens, clearTokens } from "../../shared/api/apiClient";

export class AuthService {
  static async login(id, password) {
    try {
      const data = await post("/auth/login", { id, password, role: "kitchen" });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("accessTokenUser", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || "Invalid vendor credentials or role." 
      };
    }
  }

  static signup() {
    return { success: false, error: "Kitchen registration is disabled." };
  }

  static getSession() {
    const data = localStorage.getItem("accessTokenUser");
    if (!data) return null;
    try {
      const user = JSON.parse(data);
      return user && user.role === "kitchen" ? user : null;
    } catch (e) {
      return null;
    }
  }

  static logout() {
    clearTokens();
    localStorage.removeItem("accessTokenUser");
  }
}
