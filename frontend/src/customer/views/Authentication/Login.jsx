import React, { useState } from "react";
import { AuthShell } from "../../../shared/ui";
import { UserModel } from "../../models/UserModel";

export default function Login({ onLogin, goSignup, goHome }) {
  const [role, setRole] = useState("student");
  const [matricNo, setMatric] = useState("");
  const [staffId, setStaffId] = useState("");
  const [password, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Custom focus state validation errors
  const [matricError, setMatricError] = useState("");
  const [staffError, setStaffError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setMatricError("");
    setStaffError("");
    setPasswordError("");

    let hasError = false;

    if (role === "student") {
      if (!matricNo.trim()) {
        setMatricError("Please enter your matriculation number.");
        hasError = true;
      } else {
        const idUpper = matricNo.trim().toUpperCase();
        if (!UserModel.validateMatric(idUpper)) {
          setMatricError("Use format: FUO/YY/DEPT/NNNNN (e.g. FUO/22/CSI/18842)");
          hasError = true;
        }
      }
    } else {
      if (!staffId.trim()) {
        setStaffError("Please enter your Staff ID.");
        hasError = true;
      } else {
        const idUpper = staffId.trim().toUpperCase();
        if (!UserModel.validateStaffId(idUpper)) {
          setStaffError("Use format: FUO-STAFF-0000 (e.g. FUO-STAFF-0042)");
          hasError = true;
        }
      }
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    const id = role === "student" ? matricNo : staffId;
    const idUpper = id.trim().toUpperCase();

    try {
      const res = await onLogin(idUpper, password, role);
      if (res && !res.success) {
        setError(res.error);
      }
    } catch (err) {
      setError("Authentication failed. Please check your network or try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStudent = role === "student";
  const isStaff = role === "staff";

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to access your Campus Eats account and order meals quickly and securely."
      accent="blue"
    >
      <form onSubmit={handleLogin} noValidate>
        {/* Role Selector Segment Cards */}
        <div className="auth-role-section">
          <p className="form-label" style={{ fontSize: "0.72rem", marginBottom: 12 }}>
            I AM A: <span style={{ color: "#dc2626" }}>*</span>
          </p>
          <div className="role-cards-row">
            <div
              className={`role-select-card${isStudent ? " active-student" : ""}`}
              onClick={() => { setRole("student"); setError(""); setMatricError(""); }}
              style={{ padding: "18px 12px" }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setRole("student"); setError(""); } }}
              aria-label="Select student role"
            >
              <i className="bi bi-mortarboard-fill role-card-icon" style={{ fontSize: "1.65rem", display: "block", marginBottom: 6 }} />
              <div className="role-card-label" style={{ fontSize: "0.82rem", fontWeight: "700" }}>Student</div>
            </div>
            
            <div
              className={`role-select-card${isStaff ? " active-staff" : ""}`}
              onClick={() => { setRole("staff"); setError(""); setStaffError(""); }}
              style={{ padding: "18px 12px" }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setRole("staff"); setError(""); } }}
              aria-label="Select school staff role"
            >
              <i className="bi bi-briefcase-fill role-card-icon" style={{ fontSize: "1.65rem", display: "block", marginBottom: 6 }} />
              <div className="role-card-label" style={{ fontSize: "0.82rem", fontWeight: "700" }}>School Staff</div>
            </div>
          </div>
        </div>

        {/* Input Fields with Floating Labels and Left-side Icons */}
        {isStudent && (
          <div className="floating-group">
            <i className="bi bi-mortarboard-fill input-icon-left"></i>
            <input
              type="text"
              id="matricNo"
              placeholder=" "
              value={matricNo}
              onChange={e => { setMatric(e.target.value); setMatricError(""); }}
              className={`floating-input${matricError ? " input-has-error" : ""}`}
              disabled={loading}
              autoComplete="username"
              aria-invalid={!!matricError}
              aria-describedby={matricError ? "matric-error" : undefined}
            />
            <label htmlFor="matricNo" className="floating-label">Matriculation Number</label>
            {matricError && (
              <p id="matric-error" className="field-validation-msg">
                <i className="bi bi-exclamation-circle-fill" style={{ marginRight: 4 }}></i>
                {matricError}
              </p>
            )}
          </div>
        )}

        {isStaff && (
          <div className="floating-group">
            <i className="bi bi-briefcase-fill input-icon-left"></i>
            <input
              type="text"
              id="staffId"
              placeholder=" "
              value={staffId}
              onChange={e => { setStaffId(e.target.value); setStaffError(""); }}
              className={`floating-input${staffError ? " input-has-error" : ""}`}
              disabled={loading}
              autoComplete="username"
              aria-invalid={!!staffError}
              aria-describedby={staffError ? "staff-error" : undefined}
            />
            <label htmlFor="staffId" className="floating-label">Staff ID</label>
            {staffError && (
              <p id="staff-error" className="field-validation-msg">
                <i className="bi bi-exclamation-circle-fill" style={{ marginRight: 4 }}></i>
                {staffError}
              </p>
            )}
          </div>
        )}

        <div className="floating-group" style={{ marginBottom: 12 }}>
          <i className="bi bi-lock-fill input-icon-left"></i>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder=" "
            value={password}
            onChange={e => { setPass(e.target.value); setPasswordError(""); }}
            className={`floating-input${passwordError ? " input-has-error" : ""}`}
            style={{ paddingRight: "46px" }}
            disabled={loading}
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          <label htmlFor="password" className="floating-label">Password</label>
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
          </button>
          {passwordError && (
            <p id="password-error" className="field-validation-msg">
              <i className="bi bi-exclamation-circle-fill" style={{ marginRight: 4 }}></i>
              {passwordError}
            </p>
          )}
        </div>

        {/* Forgot Password Link Row */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22 }}>
          <span 
            className="auth-footer-link" 
            style={{ fontSize: "0.82rem" }}
            onClick={() => setError("Please contact system administrators to reset institutional passwords.")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setError("Please contact system administrators to reset institutional passwords."); } }}
          >
            Forgot Password?
          </span>
        </div>

        {/* Global/Auth API errors */}
        {error && (
          <div className="auth-error animate-fade-up" style={{ marginBottom: 20 }}>
            <i className="bi bi-exclamation-circle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Premium Action Button */}
        <button
          type="submit"
          className="premium-signin-btn"
          disabled={loading}
          style={{ marginBottom: 22 }}
          aria-live="polite"
        >
          {loading ? (
            <>
              <span className="auth-spinner"></span>
              Signing In...
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-right"></i>
              Sign In
            </>
          )}
        </button>

        {/* Footer Navigation Links */}
        <div className="auth-footer-links-row">
          <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>
            New to Campus Eats?{" "}
            <span 
              onClick={goSignup} 
              className="auth-footer-link" 
              style={{ color: "#0F5132", fontWeight: "700" }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") goSignup(); }}
            >
              Create an Account
            </span>
          </span>
        </div>

        <div className="auth-footer-center-row">
          <span 
            onClick={goHome} 
            className="auth-footer-link" 
            style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") goHome(); }}
          >
            <i className="bi bi-arrow-left"></i> Back to Home
          </span>
        </div>
      </form>
    </AuthShell>
  );
}
