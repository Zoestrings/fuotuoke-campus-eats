// ================================================================
// FUOTUOKE Campus Eats — Main Router (MVC Refactored)
// Orchestrates multi-actor access controls and views.
// ================================================================

import React, { useState } from "react";
import Homepage from "./pages/Homepage";
import CustomerLogin from "./customer/views/Authentication/Login";
import CustomerSignup from "./customer/views/Authentication/Signup";
import CustomerDashboard from "./customer/views/Dashboard/CustomerDashboard";
import VendorLogin from "./vendor/views/Authentication/VendorLogin";
import VendorDashboard from "./vendor/views/Dashboard/VendorDashboard";
import AdminLogin from "./admin/views/Authentication/AdminLogin";
import AdminDashboard from "./admin/views/Dashboard/AdminDashboard";

import { AuthService as CustomerAuth } from "./customer/services/AuthService";
import { AuthService as VendorAuth } from "./vendor/services/AuthService";
import { AuthService as AdminAuth } from "./admin/services/AuthService";
import RiderLogin from "./rider/views/Authentication/RiderLogin";
import RiderDashboard from "./rider/views/Dashboard/RiderDashboard";
import { AuthService as RiderAuth } from "./rider/services/AuthService";

export default function App() {
  // Track individual sessions
  const [, setCustomerSession] = useState(() => CustomerAuth.getSession());
  const [, setVendorSession] = useState(() => VendorAuth.getSession());
  const [, setAdminSession] = useState(() => AdminAuth.getSession());
  const [, setRiderSession] = useState(() => RiderAuth.getSession());

  // Determine initial page route
  const [page, setPage] = useState(() => {
    if (AdminAuth.getSession()) return "admin_dashboard";
    if (VendorAuth.getSession()) return "vendor_dashboard";
    if (RiderAuth.getSession()) return "rider_dashboard";
    if (CustomerAuth.getSession()) return "customer_dashboard";
    return "home";
  });

  const goTo = (p) => setPage(p);

  // Authentication Callbacks
  const handleCustomerLogin = async (id, password, role) => {
    const res = await CustomerAuth.login(id, password, role);
    if (res.success) {
      setCustomerSession(res.user);
      setPage("customer_dashboard");
    }
    return res;
  };

  const handleCustomerSignup = async (signupData) => {
    const res = await CustomerAuth.signup(signupData);
    if (res.success) {
      setCustomerSession(res.user);
      setPage("customer_dashboard");
    }
    return res;
  };

  const handleCustomerLogout = () => {
    CustomerAuth.logout();
    setCustomerSession(null);
    setPage("home");
  };

  const handleVendorLogin = async (id, password) => {
    const res = await VendorAuth.login(id, password);
    if (res.success) {
      setVendorSession(res.user);
      setPage("vendor_dashboard");
    }
    return res;
  };



  const handleVendorLogout = () => {
    VendorAuth.logout();
    setVendorSession(null);
    setPage("home");
  };

  const handleAdminLogin = async (id, password) => {
    const res = await AdminAuth.login(id, password);
    if (res.success) {
      setAdminSession(res.user);
      setPage("admin_dashboard");
    }
    return res;
  };



  const handleAdminLogout = () => {
    AdminAuth.logout();
    setAdminSession(null);
    setPage("home");
  };

  const handleRiderLogin = async (id, password) => {
    const res = await RiderAuth.login(id, password);
    if (res.success) {
      setRiderSession(res.user);
      setPage("rider_dashboard");
    }
    return res;
  };

  const handleRiderSignup = async (signupData) => {
    const res = await RiderAuth.signup(signupData);
    if (res.success) {
      setRiderSession(res.user);
      setPage("rider_dashboard");
    }
    return res;
  };

  const handleRiderLogout = () => {
    RiderAuth.logout();
    setRiderSession(null);
    setPage("home");
  };

  return (
    <>
      {page === "home" && <Homepage goTo={goTo} />}
      {page === "login" && (
        <CustomerLogin
          onLogin={handleCustomerLogin}
          goSignup={() => goTo("signup")}
          goHome={() => goTo("home")}
        />
      )}
      {page === "signup" && (
        <CustomerSignup
          onSignup={handleCustomerSignup}
          goLogin={() => goTo("login")}
          goHome={() => goTo("home")}
        />
      )}
      {page === "staff_login" && (
        <RiderLogin
          onLogin={handleRiderLogin}
          onAdminLogin={handleAdminLogin}
          onVendorLogin={handleVendorLogin}
          goHome={() => goTo("home")}
        />
      )}

      {page === "customer_dashboard" && (
        <CustomerDashboard onLogoutSuccess={handleCustomerLogout} />
      )}
      {page === "vendor_dashboard" && (
        <VendorDashboard onLogoutSuccess={handleVendorLogout} />
      )}
      {page === "admin_dashboard" && (
        <AdminDashboard onLogoutSuccess={handleAdminLogout} />
      )}
      {page === "rider_dashboard" && (
        <RiderDashboard onLogoutSuccess={handleRiderLogout} />
      )}
    </>
  );
}
