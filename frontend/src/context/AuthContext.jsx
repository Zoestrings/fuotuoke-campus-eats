// ================================================================
// FUOTUOKE Campus Eats — React Authentication Context Provider
// ================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { get, post } from "../shared/api/apiClient";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Parse JWT expiry without a library (just base64 decode the payload)
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null; // convert to ms
  } catch {
    return null;
  }
}

function isTokenFresh(token) {
  if (!token) return false;
  const exp = getTokenExpiry(token);
  if (!exp) return false;
  // Consider fresh if more than 30 seconds remain
  return Date.now() < exp - 30_000;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("accessTokenUser");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || null);
  // Start as false if we already have a fresh token — avoids blocking render
  const [loading, setLoading] = useState(() => {
    const t = localStorage.getItem("accessToken");
    const u = localStorage.getItem("accessTokenUser");
    return !(t && u && isTokenFresh(t));
  });

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

  // Verify session on startup — skipped when token is demonstrably fresh
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // Fast path: token is still valid — trust stored user, skip network call
      if (isTokenFresh(token) && user) {
        setLoading(false);
        return;
      }

      // Slow path: token expired or no user data — verify with server
      try {
        setLoading(true);
        const data = await get("/auth/me");
        if (data && data.user) {
          setUser(data.user);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  const login = useCallback(async (id, password, role) => {
    try {
      const data = await post("/auth/login", { id, password, role });
      if (data && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("accessTokenUser", JSON.stringify(data.user));
        if (data.refreshToken) {
          localStorage.setItem("fuo_refresh_token", data.refreshToken);
        }
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
  }, []);

  const signup = useCallback(async (signupData) => {
    try {
      const data = await post("/auth/signup", signupData);
      if (data && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("accessTokenUser", JSON.stringify(data.user));
        if (data.refreshToken) {
          localStorage.setItem("fuo_refresh_token", data.refreshToken);
        }
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
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("fuo_refresh_token");
    // Fire-and-forget logout call to invalidate refresh token server-side
    if (refreshToken) {
      post("/auth/logout", { refreshToken }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessTokenUser");
    localStorage.removeItem("fuo_refresh_token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
