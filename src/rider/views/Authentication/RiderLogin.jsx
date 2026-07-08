import React, { useState, useEffect } from "react";
import { Btn, Field, AuthShell } from "../../../shared/ui";

export default function RiderLogin({ onLogin, onAdminLogin, onVendorLogin, goHome }) {
  const [activeRole, setActiveRole] = useState("rider");
  const [riderId, setRiderId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Clear credentials and errors when switching tabs to protect security
  useEffect(() => {
    setRiderId("");
    setPassword("");
    setError("");
    setSuccess("");
  }, [activeRole]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!riderId.trim()) {
      setError("Please enter your login ID.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    const cleanId = riderId.trim().toUpperCase();

    if (activeRole === "rider") {
      if (cleanId !== "ZOEHACKZ001") {
        if (!cleanId.startsWith("FUO-RIDER-") || cleanId.length < 14) {
          setError("Rider ID format: FUO-RIDER-XXXX (e.g. FUO-RIDER-0042)");
          return;
        }
      }
      const res = await onLogin(cleanId, password);
      if (res && !res.success) {
        setError(res.error);
      }
    } else if (activeRole === "canteen") {
      const res = await onVendorLogin(cleanId, password);
      if (res && !res.success) {
        setError(res.error);
      }
    } else {
      const res = await onAdminLogin(cleanId, password);
      if (res && !res.success) {
        setError(res.error);
      }
    }
  };

  return (
    <AuthShell
      title="Staff Portal"
      subtitle="Sign in to access your dashboard controls."
      accent="blue"
    >
      {/* Segment Selector Toggle */}
      <div style={{ display: "flex", borderRadius: 8, background: "rgba(0,0,0,0.05)", padding: 4, marginBottom: 20 }}>
        <button
          onClick={() => setActiveRole("rider")}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            borderRadius: 6,
            background: activeRole === "rider" ? "#fff" : "transparent",
            fontWeight: 700,
            fontSize: ".8rem",
            color: activeRole === "rider" ? "var(--primary)" : "var(--text-light)",
            cursor: "pointer",
            boxShadow: activeRole === "rider" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <i className="bi bi-bicycle" style={{ marginRight: 4 }} />
          Rider
        </button>
        <button
          onClick={() => setActiveRole("canteen")}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            borderRadius: 6,
            background: activeRole === "canteen" ? "#fff" : "transparent",
            fontWeight: 700,
            fontSize: ".8rem",
            color: activeRole === "canteen" ? "var(--primary)" : "var(--text-light)",
            cursor: "pointer",
            boxShadow: activeRole === "canteen" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <i className="bi bi-shop" style={{ marginRight: 4 }} />
          Canteen
        </button>
        <button
          onClick={() => setActiveRole("admin")}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            borderRadius: 6,
            background: activeRole === "admin" ? "#fff" : "transparent",
            fontWeight: 700,
            fontSize: ".8rem",
            color: activeRole === "admin" ? "var(--primary)" : "var(--text-light)",
            cursor: "pointer",
            boxShadow: activeRole === "admin" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <i className="bi bi-shield-lock" style={{ marginRight: 4 }} />
          Admin
        </button>
      </div>

      <div className="animate-fade-up">
        <Field
          label={activeRole === "rider" ? "Rider ID" : activeRole === "canteen" ? "Canteen Operator ID" : "Admin Username / Email"}
          placeholder={activeRole === "rider" ? "e.g. FUO-RIDER-0042" : "e.g. zoehackz001"}
          value={riderId}
          onChange={e => setRiderId(e.target.value)}
          hint={activeRole === "rider" ? "Format: FUO-RIDER-XXXX" : null}
        />
      </div>

      <Field
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {error && (
        <div className="auth-error animate-fade-up" style={{ marginBottom: 16 }}>
          <i className="bi bi-exclamation-circle-fill" />
          {error}
        </div>
      )}

      {success && (
        <div className="auth-success animate-fade-up" style={{ color: "var(--green-text)", background: "rgba(52, 211, 153, 0.1)", border: "1px solid var(--green-text)", padding: 12, borderRadius: 8, fontSize: ".88rem", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <i className="bi bi-check-circle-fill" />
          {success}
        </div>
      )}

      <Btn full variant="primary" onClick={handleSubmit} className="auth-submit-btn">
        <i className="bi bi-box-arrow-in-right" />
        {" Sign In"}
      </Btn>

      <p className="auth-back-text" style={{ marginTop: 24, textAlign: "center" }}>
        <span onClick={goHome} className="auth-back-link" style={{ cursor: "pointer", color: "var(--text-light)", fontSize: ".84rem" }}>
          <i className="bi bi-arrow-left" /> Back to Home
        </span>
      </p>
    </AuthShell>
  );
}
