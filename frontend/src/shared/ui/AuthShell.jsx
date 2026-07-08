import React from "react";

function AuthShell({ title, subtitle, accent = "blue", children }) {
  const isGold = accent === "gold";

  return (
    <div className="auth-page">
      {/* Left branded panel — visible on desktop */}
      <div className={`auth-panel ${isGold ? "auth-panel-gold" : ""}`}>
        <div className="auth-panel-inner">
          <div className="auth-panel-brand">
            <img src="/FUO_Logo.png" alt="FUOTUOKE" className="auth-panel-logo" />
            <div>
              <div className="auth-panel-title">FUOTUOKE<br />Campus Eats</div>
            </div>
          </div>

          <div className="auth-panel-tagline">
            {isGold
              ? "Start ordering fresh campus meals today."
              : "Welcome back to your campus kitchen."}
          </div>

          <div className="auth-panel-features">
            {[
              { icon: "bi-lightning-charge-fill", text: "Instant ordering" },
              { icon: "bi-truck", text: "Faculty delivery" },
              { icon: "bi-shield-check", text: "Secure & reliable" },
            ].map(f => (
              <div key={f.text} className="auth-panel-feat">
                <i className={`bi ${f.icon}`} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="auth-panel-motto">Knowledge · Excellence · Service</div>
        </div>

        {/* Decorative watermark */}
        <div className="auth-panel-watermark" aria-hidden="true">
          <img src="/FUO_Logo.png" alt="" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-form-scroll">
          <div className="auth-form-card animate-fade-up">
            {/* Mobile-only brand row */}
            <div className="auth-mobile-brand">
              <img src="/FUO_Logo.png" alt="FUOTUOKE" />
              <span>FUOTUOKE Campus Eats</span>
            </div>

            <div className={`auth-form-header ${isGold ? "auth-form-header-gold" : ""}`}>
              <h2>{title}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>

            <div className="auth-form-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
