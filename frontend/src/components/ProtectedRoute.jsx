// ================================================================
// FUOTUOKE Campus Eats — Protected Route Layout Guard
// ================================================================

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-main)",
        fontSize: "1.2rem",
        fontWeight: 500
      }}>
        <div style={{ textAlign: "center" }}>
          <i className="bi bi-arrow-repeat spin" style={{ fontSize: "2.5rem", color: "var(--primary)", display: "block", marginBottom: 15 }} />
          Loading secure portal...
        </div>
      </div>
    );
  }

  // If no token or user, redirect to homepage/login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // If role is not authorized, redirect to their default dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "kitchen") return <Navigate to="/vendor/dashboard" replace />;
    if (user.role === "rider") return <Navigate to="/rider/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  // Allow access
  return <Outlet />;
}
