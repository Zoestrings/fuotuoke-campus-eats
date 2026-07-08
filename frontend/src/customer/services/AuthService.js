// ================================================================
// FUOTUOKE Campus Eats — Customer Auth Service (Production-ready API-backed)
// ================================================================

import { post, setTokens, clearTokens } from "../../shared/api/apiClient";

export class AuthService {
  static async login(id, password, role) {
    try {
      const data = await post("/auth/login", { id, password, role });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("accessTokenUser", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || "Invalid credentials or role." 
      };
    }
  }

  static async signup({ id, password, role, name, email }) {
    try {
      const data = await post("/auth/signup", { id, password, role, name, email });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("accessTokenUser", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || "Registration failed." 
      };
    }
  }

  static getSession() {
    const data = localStorage.getItem("accessTokenUser");
    if (!data) return null;
    try {
      const user = JSON.parse(data);
      return user && (user.role === "student" || user.role === "staff") ? user : null;
    } catch (e) {
      return null;
    }
  }

  static logout() {
    clearTokens();
    localStorage.removeItem("accessTokenUser");
  }
}
