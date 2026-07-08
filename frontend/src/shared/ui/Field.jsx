import React, { useState } from "react";

function Field({ label, type = "text", placeholder, value, onChange, hint, autoComplete, ...rest }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const computedAutoComplete = autoComplete || (isPassword ? "new-password" : "one-time-code");

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="form-input-wrapper">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="form-input"
          style={{ paddingRight: isPassword ? 42 : 13 }}
          autoComplete={computedAutoComplete}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="form-input-icon"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
          </button>
        )}
      </div>
      {hint && <p style={{ fontSize: ".72rem", color: "var(--text-muted)", marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

export default Field;
