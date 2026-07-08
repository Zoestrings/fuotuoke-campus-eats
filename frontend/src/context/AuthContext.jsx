// ================================================================
// FUOTUOKE Campus Eats — React Authentication Context Provider
// ================================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { get, post } from "../shared/api/apiClient";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("accessTokenUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("accessTokenUser");
    }
  }, [user]);

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await get("/auth/me");
        if (data && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const login = async (id, password, role) => {
    try {
      const data = await post("/auth/login", {
        id,
        password,
        role
      });
      if (data && data.accessToken) {
        setToken(data.accessToken);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: "Authentication failed." };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || "Invalid username, password, or role."
      };
    }
  };

  const signup = async (signupData) => {
    try {
      const data = await post("/auth/signup", signupData);
      if (data && data.accessToken) {
        setToken(data.accessToken);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: "Signup failed." };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || "Registration failed. Try again."
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
