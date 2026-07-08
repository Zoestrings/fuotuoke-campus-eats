// ================================================================
// FUOTUOKE Campus Eats — Admin Auth Service (Production-ready API-backed)
// ================================================================

import { post, setTokens, clearTokens } from "../../shared/api/apiClient";

export class AuthService {
  static async login(id, password) {
    try {
      const data = await post("/auth/login", { id, password, role: "admin" });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("accessTokenUser", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || "Invalid admin credentials or role." 
      };
    }
  }

  static signup() {
    return { success: false, error: "Admin registration is disabled." };
  }

  static getSession() {
    const data = localStorage.getItem("accessTokenUser");
    if (!data) return null;
    try {
      const user = JSON.parse(data);
      return user && user.role === "admin" ? user : null;
    } catch (e) {
      return null;
    }
  }

  static logout() {
    clearTokens();
    localStorage.removeItem("accessTokenUser");
  }
}
