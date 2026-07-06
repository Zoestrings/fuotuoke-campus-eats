// ================================================================
// FUOTUOKE Campus Eats — Customer Auth Service (API-backed)
// ================================================================

import { post, get, setTokens, clearTokens } from "../../shared/api/apiClient";
import { db } from "../../shared/database/db";

export class AuthService {
  static async login(id, password, role) {
    try {
      const data = await post("/auth/login", { id, password, role });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("fuo_session", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.warn("API login failed, falling back to local DB:", error.message);
      const user = db.findOne("users", { id: id.toUpperCase(), role });
      if (!user) {
        return { success: false, error: "Invalid credentials or role." };
      }
      if (user.status !== "active") {
        return { success: false, error: "This account has been suspended by Admin." };
      }
      if (user.password !== password) {
        return { success: false, error: "Incorrect password." };
      }
      localStorage.setItem("fuo_session", JSON.stringify(user));
      return { success: true, user };
    }
  }

  static async signup({ id, password, role, name, email }) {
    try {
      const data = await post("/auth/signup", { id, password, role, name, email });
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("fuo_session", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      console.warn("API signup failed, falling back to local DB:", error.message);
      const existing = db.findOne("users", { id: id.toUpperCase() });
      if (existing) {
        return { success: false, error: "An account with this ID already exists." };
      }
      const newUser = db.insert("users", {
        id: id.toUpperCase(),
        role,
        name,
        email,
        password,
        status: "active",
        createdAt: new Date().toLocaleDateString()
      });
      localStorage.setItem("fuo_session", JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
  }

  static getSession() {
    const data = localStorage.getItem("fuo_session");
    return data ? JSON.parse(data) : null;
  }

  static logout() {
    clearTokens();
  }
}
