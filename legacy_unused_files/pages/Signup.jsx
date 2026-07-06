import React, { useState } from "react";
import { Btn, Field, AuthShell } from "../components/ui";

const checks = [
  { label: "At least 8 characters", test: p => p.length >= 8 },
  { label: "Uppercase & lowercase letters", test: p => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: "At least one number", test: p => /[0-9]/.test(p) },
  { label: "Special character (!@#$%^&*)", test: p => /[!@#$%^&*]/.test(p) },
];

export default function Signup({ goLogin, goHome, onAuth }) {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [matricNo, setMatric] = useState("");
  const [staffId, setStaffId] = useState("");
  const [kitchenId, setKitchenId] = useState("");
  const [error, setError] = useState("");

  function handleSignup() {
    setError("");
    if (!firstName.trim() || !lastName.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (!password.trim()) { setError("Please create a password."); return; }
    for (const c of checks) { if (!c.test(password)) { setError(`Password must have: ${c.label.toLowerCase()}.`); return; } }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (!role) { setError("Please select your role."); return; }
    if (role === "student") {
      if (!matricNo.trim()) { setError("Please enter your matriculation number."); return; }
      if (!/^FUO\/\d{2}\/[A-Z]{3,4}\/\d{5}$/.test(matricNo.toUpperCase())) { setError("Matric format: FUO/YY/DEPT/NNNNN (e.g. FUO/22/CSI/18842)"); return; }
    }
    if (role === "staff") {
      if (!staffId.trim()) { setError("Please enter your Staff ID."); return; }
      if (!/^FUO-STAFF-\d{4}$/.test(staffId.toUpperCase())) { setError("Staff ID format: FUO-STAFF-0000 (e.g. FUO-STAFF-0042)"); return; }
    }
    if (role === "kitchen") {
      if (!kitchenId.trim()) { setError("Please enter your Kitchen ID."); return; }
      if (!/^FUO-KIT-\d{4}$/.test(kitchenId.toUpperCase())) { setError("Kitchen ID format: FUO-KIT-0000 (e.g. FUO-KIT-0042)"); return; }
    }
    onAuth({
      role,
      name: `${firstName} ${lastName}`,
      email,
      id: role === "student"
        ? matricNo.toUpperCase()
        : (role === "staff" ? staffId.toUpperCase() : kitchenId.toUpperCase())
    });
  }

  const strengthCount = checks.filter(c => c.test(password)).length;

  return (
    <AuthShell title="Create Your Account" subtitle="Join FUOTUOKE Campus Eats  students & staff welcome." accent="gold">

      {/* Name row */}
      <div className="auth-name-row">
        <Field label="First Name" placeholder="e.g. Emeka" value={firstName} onChange={e => setFirst(e.target.value)} />
        <Field label="Surname" placeholder="e.g. Okafor" value={lastName} onChange={e => setLast(e.target.value)} />
      </div>

      <Field label="Email Address" type="email" placeholder="you@fuotuoke.edu.ng" value={email} onChange={e => setEmail(e.target.value)} />
      <Field label="Password" type="password" placeholder="Create a strong password" value={password} onChange={e => setPass(e.target.value)} />

      {/* Strength meter */}
      {password && (
        <div className="auth-strength-box">
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

      {/* Role selection */}
      <div className="auth-role-box">
        <p className="form-label">
          I am a: <span className="auth-required">*</span>
        </p>
        <div className="auth-role-options">
          {[
            { val: "student", icon: "bi-mortarboard-fill", label: "Student", sub: "Undergraduate / Postgraduate", accentClass: "active-student" },
            { val: "staff", icon: "bi-briefcase-fill", label: "School Staff", sub: "Academic / Administrative", accentClass: "active-staff" },
            { val: "kitchen", icon: "bi-fire", label: "Kitchen Staff", sub: "Canteen / Kitchen Managers", accentClass: "active-kitchen" },
          ].map(({ val, icon, label, sub }) => (
            <div key={val}>
              <label className="auth-role-option" onClick={() => setRole(role === val ? "" : val)}>
                <div className={`auth-role-checkbox ${role === val ? (val === "student" ? "auth-cb-primary" : "auth-cb-gold") : ""}`}>
                  {role === val && <i className="bi bi-check" />}
                </div>
                <i className={`bi ${icon} auth-role-opt-icon ${role === val ? (val === "student" ? "auth-icon-primary" : "auth-icon-gold") : ""}`} />
                <div className="auth-role-opt-text">
                  <span className="auth-role-opt-label">{label}</span>
                  <span className="auth-role-opt-sub">{sub}</span>
                </div>
              </label>
              {role === val && val === "student" && (
                <div className="auth-role-id-field animate-fade-up">
                  <Field label="Matriculation Number" placeholder="e.g. FUO/22/CSI/18842" value={matricNo} onChange={e => setMatric(e.target.value)} hint="Format: FUO/YY/DEPT/NNNNN" />
                </div>
              )}
              {role === val && val === "staff" && (
                <div className="auth-role-id-field animate-fade-up">
                  <Field label="Staff ID" placeholder="e.g. FUO-STAFF-0042" value={staffId} onChange={e => setStaffId(e.target.value)} hint="Format: FUO-STAFF-0000" />
                </div>
              )}
              {role === val && val === "kitchen" && (
                <div className="auth-role-id-field animate-fade-up">
                  <Field label="Kitchen ID" placeholder="e.g. FUO-KIT-0042" value={kitchenId} onChange={e => setKitchenId(e.target.value)} hint="Format: FUO-KIT-0000" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="auth-error">
          <i className="bi bi-exclamation-circle-fill" />
          {error}
        </div>
      )}

      <Btn full variant="gold" onClick={handleSignup} className="auth-submit-btn">
        <i className="bi bi-person-check-fill" /> Create Account
      </Btn>

      <p className="auth-switch-text">
        Already have an account?{" "}
        <span onClick={goLogin} className="auth-switch-link auth-switch-link-green">Sign In</span>
      </p>
      <p className="auth-back-text">
        <span onClick={goHome} className="auth-back-link">
          <i className="bi bi-arrow-left" /> Back to Home
        </span>
      </p>
    </AuthShell>
  );
}
