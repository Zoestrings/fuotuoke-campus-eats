import React, { useState } from "react";
import { Btn, Field, AuthShell } from "../../../shared/ui";

const checks = [
  { label: "At least 8 characters", test: p => p.length >= 8 },
  { label: "Uppercase & lowercase letters", test: p => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: "At least one number", test: p => /[0-9]/.test(p) },
  { label: "Special character (!@#$%^&*)", test: p => /[!@#$%^&*]/.test(p) },
];

export default function AdminSignup({ onSignup, goLogin, goHome }) {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [adminId, setAdminId] = useState("");
  const [error, setError] = useState("");

  const handleSignupSubmit = () => {
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!adminId.trim()) {
      setError("Please enter your Admin Username / ID.");
      return;
    }

    if (!password.trim()) {
      setError("Please create a password.");
      return;
    }
    const meetsComplexity = checks.every(c => c.test(password));
    if (!meetsComplexity) {
      setError("Password does not meet complexity requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const res = onSignup({
      id: adminId.toUpperCase().trim(),
      password,
      name: `${firstName} ${lastName}`,
      email
    });
    
    if (!res.success) {
      setError(res.error);
    }
  };

  const strengthCount = checks.filter(c => c.test(password)).length;

  return (
    <AuthShell title="Register Platform Admin" subtitle="Sign up to manage Campus Eats." accent="blue">
      <div className="auth-name-row">
        <Field label="First Name" placeholder="e.g. Samuel" value={firstName} onChange={e => setFirst(e.target.value)} />
        <Field label="Surname" placeholder="e.g. Ojo" value={lastName} onChange={e => setLast(e.target.value)} />
      </div>

      <Field label="Email Address" type="email" placeholder="admin@fuotuoke.edu.ng" value={email} onChange={e => setEmail(e.target.value)} />

      <Field 
        label="Username / ID" 
        placeholder="e.g. ADMIN_JOE" 
        value={adminId} 
        onChange={e => setAdminId(e.target.value)} 
      />

      <Field label="Password" type="password" placeholder="Create a strong password" value={password} onChange={e => setPass(e.target.value)} />

      {password && (
        <div className="auth-strength-box animate-fade-up">
          <div className="auth-strength-bars">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className={`auth-strength-bar ${n <= strengthCount ? `auth-strength-level-${strengthCount}` : ""}`}
              />
            ))}
          </div>
          <div className="auth-strength-checks">
            {checks.map(c => (
              <div key={c.label} className={`auth-strength-check ${c.test(password) ? "auth-check-pass" : ""}`}>
                <i className={`bi ${c.test(password) ? "bi-check-circle-fill" : "bi-circle"}`} />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <Field label="Confirm Password" type="password" placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} />

      {error && (
        <div className="auth-error animate-fade-up">
          <i className="bi bi-exclamation-circle-fill" />
          {error}
        </div>
      )}

      <Btn full variant="primary" onClick={handleSignupSubmit} className="auth-submit-btn" style={{ background: "var(--primary)" }}>
        <i className="bi bi-shield-lock" /> Register Admin
      </Btn>

      <p className="auth-switch-text">
        Already registered?{" "}
        <span onClick={goLogin} className="auth-switch-link">Sign In</span>
      </p>
      
      <p className="auth-back-text">
        <span onClick={goHome} className="auth-back-link">
          <i className="bi bi-arrow-left" /> Back to Home
        </span>
      </p>
    </AuthShell>
  );
}
