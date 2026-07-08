// ================================================================
// FUOTUOKE Campus Eats — React Authentication Context Provider
// ================================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common["Authorization"];
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
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.user) {
          setUser(response.data.user);
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
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        id,
        password,
        role
      });
      if (response.data && response.data.accessToken) {
        setToken(response.data.accessToken);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: "Authentication failed." };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Invalid username, password, or role."
      };
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", signupData);
      if (response.data && response.data.accessToken) {
        setToken(response.data.accessToken);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: "Signup failed." };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Registration failed. Try again."
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
