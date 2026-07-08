import React, { useState } from "react";
import { Btn, Field, AuthShell } from "../../../shared/ui";
import { UserModel } from "../../models/UserModel";

export default function Login({ onLogin, goSignup, goHome }) {
  const [role, setRole] = useState("student"); // customer can be student or staff
  const [matricNo, setMatric] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const id = role === "student" ? matricNo : staffId;
    if (!id.trim()) {
      setError(role === "student" ? "Please enter your matriculation number." : "Please enter your Staff ID.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    const idUpper = id.trim().toUpperCase();
    if (role === "student" && !UserModel.validateMatric(idUpper)) {
      setError("Matric format: FUO/YY/DEPT/NNNNN (e.g. FUO/22/CSI/18842)");
      return;
    }
    if (role === "staff" && !UserModel.validateStaffId(idUpper)) {
      setError("Staff ID format: FUO-STAFF-0000 (e.g. FUO-STAFF-0042)");
      return;
    }

    const res = await onLogin(idUpper, password, role);
    if (res && !res.success) {
      setError(res.error);
    }
  };

  const isStudent = role === "student";
  const isStaff = role === "staff";

  return (
    <AuthShell title="Customer Sign In" subtitle="Sign in to order fresh meals." accent="blue">
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
        </div>
      </div>

      {isStudent && (
        <div className="animate-fade-up">
          <Field
            label="Matriculation Number"
            placeholder="e.g. FUO/22/CSI/18842"
            value={matricNo}
            onChange={e => setMatric(e.target.value)}
            hint="Format: FUO/YY/DEPT/NNNNN"
          />
        </div>
      )}
      {isStaff && (
        <div className="animate-fade-up">
          <Field
            label="Staff ID"
            placeholder="e.g. FUO-STAFF-0042"
            value={staffId}
            onChange={e => setStaffId(e.target.value)}
            hint="Format: FUO-STAFF-0000"
          />
        </div>
      )}

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

      <Btn full variant="primary" onClick={handleLogin} className="auth-submit-btn">
        <i className="bi bi-box-arrow-in-right" /> Sign In
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
