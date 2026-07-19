// ================================================================
// FUOTUOKE Campus Eats — React Router & Guarded Navigation (App.js)
// Orchestrates multi-actor access controls using React Router v6.
// ================================================================

import React, { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Always-loaded (critical path — shown on first render)
import Homepage from "./pages/Homepage";
import CustomerLogin from "./customer/views/Authentication/Login";
import CustomerSignup from "./customer/views/Authentication/Signup";
import RiderLogin from "./rider/views/Authentication/RiderLogin";

// Lazy-loaded dashboards (split into separate chunks, loaded on demand)
const CustomerDashboard = lazy(() => import("./customer/views/Dashboard/CustomerDashboard"));
const RiderDashboard    = lazy(() => import("./rider/views/Dashboard/RiderDashboard"));
const VendorDashboard   = lazy(() => import("./vendor/views/Dashboard/VendorDashboard"));
const AdminDashboard    = lazy(() => import("./admin/views/Dashboard/AdminDashboard"));

// Minimal loading fallback shown while a chunk is being fetched
function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-main, #f7f5f0)"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48,
          border: "4px solid #e4e0d8",
          borderTop: "4px solid #1a5c36",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px"
        }} />
        <p style={{ color: "#857e74", fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>
          Loading…
        </p>
      </div>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
