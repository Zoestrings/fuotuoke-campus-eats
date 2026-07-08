import React, { useState } from "react";
import { Btn, Field, AuthShell } from "../../../shared/ui";

export default function VendorLogin({ onLogin, goSignup, goHome }) {
  const [kitchenId, setKitchenId] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = async () => {
    setError("");
    if (!kitchenId.trim()) {
      setError("Please enter your Kitchen ID.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    const res = await onLogin(kitchenId, password);
    if (res && !res.success) {
      setError(res.error);
    }
  };

  return (
    <AuthShell title="Canteen staff hub" subtitle="Sign in to manage your canteen orders." accent="gold">
      <Field
        label="Username"
        placeholder="Enter Kitchen Username"
        value={kitchenId}
        onChange={e => setKitchenId(e.target.value)}
      />
      <Field
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={e => setPass(e.target.value)}
      />

      {error && (
        <div className="auth-error animate-fade-up">
          <i className="bi bi-exclamation-circle-fill" />
          {error}
        </div>
      )}

      <Btn full variant="gold" onClick={handleLoginSubmit} className="auth-submit-btn">
        <i className="bi bi-box-arrow-in-right" /> Sign In to Kitchen
      </Btn>

      <p className="auth-back-text">
        <span onClick={goHome} className="auth-back-link">
          <i className="bi bi-arrow-left" /> Back to Home
        </span>
      </p>
    </AuthShell>
  );
}
