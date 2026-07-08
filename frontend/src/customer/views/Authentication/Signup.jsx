import React, { useState } from "react";
import { Btn, Field, AuthShell } from "../../../shared/ui";
import { UserModel } from "../../models/UserModel";

const checks = [
  { label: "At least 8 characters", test: p => p.length >= 8 },
  { label: "Uppercase & lowercase letters", test: p => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: "At least one number", test: p => /[0-9]/.test(p) },
  { label: "Special character (!@#$%^&*)", test: p => /[!@#$%^&*]/.test(p) },
];

export default function Signup({ onSignup, goLogin, goHome }) {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student");
  const [matricNo, setMatric] = useState("");
  const [staffId, setStaffId] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !UserModel.validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please create a password.");
      return;
    }
    if (!UserModel.validatePassword(password)) {
      setError("Password does not meet complexity requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const id = role === "student" ? matricNo : staffId;
    if (!id.trim()) {
      setError(role === "student" ? "Please enter your matriculation number." : "Please enter your Staff ID.");
      return;
    }

    const idUpper = id.toUpperCase();
    if (role === "student" && !UserModel.validateMatric(idUpper)) {
      setError("Matric format: FUO/YY/DEPT/NNNNN (e.g. FUO/22/CSI/18842)");
      return;
    }
    if (role === "staff" && !UserModel.validateStaffId(idUpper)) {
      setError("Staff ID format: FUO-STAFF-0000 (e.g. FUO-STAFF-0042)");
      return;
    }

    const res = await onSignup({
      id: idUpper,
      password,
      role,
      name: `${firstName} ${lastName}`,
      email
    });
    if (res && !res.success) {
      setError(res.error);
    }
  };

  const strengthCount = checks.filter(c => c.test(password)).length;
  const isStudent = role === "student";
  const isStaff = role === "staff";

  return (
    <AuthShell title="Create Customer Account" subtitle="Join FUOTUOKE Campus Eats." accent="gold">
      <div className="auth-name-row">
        <Field label="First Name" placeholder="e.g. Emeka" value={firstName} onChange={e => setFirst(e.target.value)} />
        <Field label="Surname" placeholder="e.g. Okafor" value={lastName} onChange={e => setLast(e.target.value)} />
      </div>

      <Field label="Email Address" type="email" placeholder="you@fuotuoke.edu.ng" value={email} onChange={e => setEmail(e.target.value)} />
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

      <div className="auth-role-box">
        <p className="form-label">
          I am a: <span className="auth-required">*</span>
        </p>
        <div className="auth-role-options">
          {[
            { val: "student", icon: "bi-mortarboard-fill", label: "Student", sub: "Undergraduate / Postgraduate" },
            { val: "staff", icon: "bi-briefcase-fill", label: "School Staff", sub: "Academic / Administrative" }
          ].map(({ val, icon, label, sub }) => (
            <div key={val}>
              <label className="auth-role-option" onClick={() => { setRole(val); setError(""); }}>
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
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="auth-error animate-fade-up">
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
