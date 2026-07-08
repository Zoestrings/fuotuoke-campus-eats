// ================================================================
// FUOTUOKE Campus Eats — React Router & Guarded Navigation (App.js)
// Orchestrates multi-actor access controls using React Router v6.
// ================================================================

import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Homepage from "./pages/Homepage";
import CustomerLogin from "./customer/views/Authentication/Login";
import CustomerSignup from "./customer/views/Authentication/Signup";
import CustomerDashboard from "./customer/views/Dashboard/CustomerDashboard";
import RiderLogin from "./rider/views/Authentication/RiderLogin";
import RiderDashboard from "./rider/views/Dashboard/RiderDashboard";
import VendorDashboard from "./vendor/views/Dashboard/VendorDashboard";
import AdminDashboard from "./admin/views/Dashboard/AdminDashboard";

function AppRoutes() {
  const { login, signup, logout } = useAuth();
  const navigate = useNavigate();

  // Authentication Wrapper Callbacks (preserving original prop signatures)
  const handleCustomerLogin = async (id, password, role) => {
    const res = await login(id, password, role);
    if (res.success) {
      navigate("/customer/dashboard");
    }
    return res;
  };

  const handleCustomerSignup = async (signupData) => {
    const res = await signup(signupData);
    if (res.success) {
      navigate("/customer/dashboard");
    }
    return res;
  };

  const handleRiderLogin = async (id, password) => {
    const res = await login(id, password, "rider");
    if (res.success) {
      navigate("/rider/dashboard");
    }
    return res;
  };

  const handleAdminLogin = async (id, password) => {
    const res = await login(id, password, "admin");
    if (res.success) {
      navigate("/admin/dashboard");
    }
    return res;
  };

  const handleVendorLogin = async (id, password) => {
    const res = await login(id, password, "kitchen");
    if (res.success) {
      navigate("/vendor/dashboard");
    }
    return res;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/" element={<Homepage goTo={(path) => navigate(path === "home" ? "/" : `/${path}`)} />} />
      
      <Route
        path="/login"
        element={
          <CustomerLogin
            onLogin={handleCustomerLogin}
            goSignup={() => navigate("/signup")}
            goHome={() => navigate("/")}
          />
        }
      />
      
      <Route
        path="/signup"
        element={
          <CustomerSignup
            onSignup={handleCustomerSignup}
            goLogin={() => navigate("/login")}
            goHome={() => navigate("/")}
          />
        }
      />
      
      <Route
        path="/staff_login"
        element={
          <RiderLogin
            onLogin={handleRiderLogin}
            onAdminLogin={handleAdminLogin}
            onVendorLogin={handleVendorLogin}
            goHome={() => navigate("/")}
          />
        }
      />

      {/* ── Protected Customer Dashboard ── */}
      <Route element={<ProtectedRoute allowedRoles={["student", "staff"]} />}>
        <Route path="/customer/dashboard" element={<CustomerDashboard onLogoutSuccess={handleLogout} />} />
      </Route>

      {/* ── Protected Canteen/Vendor Dashboard ── */}
      <Route element={<ProtectedRoute allowedRoles={["kitchen"]} />}>
        <Route path="/vendor/dashboard" element={<VendorDashboard onLogoutSuccess={handleLogout} />} />
      </Route>

      {/* ── Protected Admin Dashboard ── */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard onLogoutSuccess={handleLogout} />} />
      </Route>

      {/* ── Protected Rider Dashboard ── */}
      <Route element={<ProtectedRoute allowedRoles={["rider"]} />}>
        <Route path="/rider/dashboard" element={<RiderDashboard onLogoutSuccess={handleLogout} />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
