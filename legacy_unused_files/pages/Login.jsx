import React, { useState } from "react";
import { Btn, Field, AuthShell } from "../components/ui";

export default function Login({ goSignup, goHome, onAuth }) {
  const [role, setRole]       = useState("");
  const [matricNo, setMatric] = useState("");
  const [staffId, setStaffId] = useState("");
  const [kitchenId, setKitchenId] = useState("");
  const [password, setPass]   = useState("");
  const [error, setError]     = useState("");

  function handleLogin() {
    setError("");
    if (!role) { setError("Please select whether you are a Student, School Staff, or Kitchen Staff."); return; }
    const id = role === "student" ? matricNo : (role === "staff" ? staffId : kitchenId);
    if (!id.trim()) {
      setError(
        role === "student"
          ? "Please enter your matriculation number."
          : (role === "staff" ? "Please enter your Staff ID." : "Please enter your Kitchen ID.")
      );
      return;
    }
    if (!password.trim()) { setError("Please enter your password."); return; }
    const idUpper = id.toUpperCase();
    if (role === "student") {
      if (!/^FUO\/\d{2}\/[A-Z]{3,4}\/\d{5}$/.test(idUpper)) { setError("Matric format: FUO/YY/DEPT/NNNNN (e.g. FUO/22/CSI/18842)"); return; }
    }
    if (role === "staff") {
      if (!/^FUO-STAFF-\d{4}$/.test(idUpper)) { setError("Staff ID format: FUO-STAFF-0000 (e.g. FUO-STAFF-0042)"); return; }
    }
    if (role === "kitchen") {
      if (!/^FUO-KIT-\d{4}$/.test(idUpper)) { setError("Kitchen ID format: FUO-KIT-0000 (e.g. FUO-KIT-0042)"); return; }
    }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    onAuth({
      role,
      name: role === "student"
        ? `Student (${idUpper})`
        : (role === "staff" ? `Staff (${idUpper})` : `Kitchen (${idUpper})`),
      id: idUpper
    });
  }

  const isStudent = role === "student";
  const isStaff   = role === "staff";
  const isKitchen = role === "kitchen";

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to your Campus Eats account." accent="blue">

      {/* Role selector */}
      <div className="auth-role-section">
        <p className="form-label">
          I am a: <span className="auth-required">*</span>
        </p>
        <div className="role-cards-row">
          <div
            className={`role-select-card${isStudent ? " active-student" : ""}`}
            onClick={() => { setRole("student"); setError(""); }}
          >
            <i className="bi bi-mortarboard-fill role-card-icon" />
            <div className="role-card-label">Student</div>
          </div>
          <div
            className={`role-select-card${isStaff ? " active-staff" : ""}`}
            onClick={() => { setRole("staff"); setError(""); }}
          >
            <i className="bi bi-briefcase-fill role-card-icon" />
            <div className="role-card-label">School Staff</div>
          </div>
          <div
            className={`role-select-card${isKitchen ? " active-kitchen" : ""}`}
            onClick={() => { setRole("kitchen"); setError(""); }}
          >
            <i className="bi bi-fire role-card-icon" />
            <div className="role-card-label">Kitchen Staff</div>
          </div>
        </div>
      </div>

      {/* ID fields */}
      {isStudent && (
        <div className="animate-fade-up">
          <Field label="Matriculation Number" placeholder="e.g. FUO/22/CSI/18842" value={matricNo} onChange={e => setMatric(e.target.value)} hint="Format: FUO/YY/DEPT/NNNNN" />
        </div>
      )}
      {isStaff && (
        <div className="animate-fade-up">
          <Field label="Staff ID" placeholder="e.g. FUO-STAFF-0042" value={staffId} onChange={e => setStaffId(e.target.value)} hint="Format: FUO-STAFF-0000" />
        </div>
      )}
      {isKitchen && (
        <div className="animate-fade-up">
          <Field label="Kitchen ID" placeholder="e.g. FUO-KIT-0042" value={kitchenId} onChange={e => setKitchenId(e.target.value)} hint="Format: FUO-KIT-0000" />
        </div>
      )}

      <Field label="Password" type="password" placeholder="Enter your password" value={password} onChange={e => setPass(e.target.value)} />

      <div className="auth-forgot-row">
        <a href="#" className="auth-forgot-link">Forgot password?</a>
      </div>

      {error && (
        <div className="auth-error">
          <i className="bi bi-exclamation-circle-fill" />
          {error}
        </div>
      )}

      <Btn full variant="primary" onClick={handleLogin} className="auth-submit-btn">
        <i className="bi bi-box-arrow-in-right" /> Sign In to Campus Eats
      </Btn>

      <p className="auth-switch-text">
        No account?{" "}
        <span onClick={goSignup} className="auth-switch-link">Create one here</span>
      </p>
      <p className="auth-back-text">
        <span onClick={goHome} className="auth-back-link">
          <i className="bi bi-arrow-left" /> Back to Home
        </span>
      </p>
    </AuthShell>
  );
}
