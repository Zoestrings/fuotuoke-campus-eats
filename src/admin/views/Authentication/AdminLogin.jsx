import React, { useState } from "react";
import { Btn, Field, AuthShell } from "../../../shared/ui";

export default function AdminLogin({ onLogin, goSignup, goHome }) {
  const [adminId, setAdminId] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = async () => {
    setError("");
    if (!adminId.trim()) {
      setError("Please enter your Admin Username.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    const res = await onLogin(adminId, password);
    if (res && !res.success) {
      setError(res.error);
    }
  };

  return (
    <AuthShell title="Admin control panel" subtitle="Sign in to manage the Campus Eats platform." accent="blue">
      <Field
        label="Username"
        placeholder="Enter Admin Username"
        value={adminId}
        onChange={e => setAdminId(e.target.value)}
      />
      <Field
        label="Password"
        type="password"
        placeholder="Enter Admin password"
        value={password}
        onChange={e => setPass(e.target.value)}
      />

      {error && (
        <div className="auth-error animate-fade-up">
          <i className="bi bi-exclamation-circle-fill" />
          {error}
        </div>
      )}

      <Btn full variant="primary" onClick={handleLoginSubmit} className="auth-submit-btn" style={{ background: "var(--primary)" }}>
         <i className="bi bi-shield-lock" /> Sign In as Admin
      </Btn>

      <p className="auth-back-text">
        <span onClick={goHome} className="auth-back-link">
          <i className="bi bi-arrow-left" /> Back to Home
        </span>
      </p>
    </AuthShell>
  );
}
