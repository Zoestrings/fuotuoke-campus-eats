import React from "react";
import { OUTLETS } from "../data";

export default function Homepage({ goTo }) {



  return (
    <div className="hp">
      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="hp-nav">
        <div className="hp-nav-brand">
          <img
            src="/FUO_Logo.png"
            alt="FUOTUOKE Logo"
            className="hp-nav-logo"
            fetchpriority="high"
            decoding="async"
          />
          <div>
            <div className="hp-nav-title">FUOTUOKE Campus Eats</div>
            <div className="hp-nav-sub">Federal University Otuoke</div>
          </div>
        </div>
        <div className="hp-nav-actions">
          <button className="btn btn-ghost" onClick={() => goTo("login")}>
            <i className="bi bi-box-arrow-in-right" /> Login
          </button>
          <button className="btn btn-gold" onClick={() => goTo("signup")}>
            <i className="bi bi-person-plus" /> Sign Up
          </button>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────── */}
      <section className="hp-hero">
        {/* Decorative grid */}
        <div className="hp-hero-grid" aria-hidden="true" />

        <div className="hp-hero-inner">


          <h1 className="hp-hero-title animate-fade-up stagger-1">
            Campus Food,<br />
            <span className="hp-hero-highlight">On Your Schedule.</span>
          </h1>

          <p className="hp-hero-desc animate-fade-up stagger-2">
            Order freshly made meals from FUOTUOKE's canteens. Pickup or get
            delivered straight to your faculty available to all students and staff.
          </p>

          <div className="hp-hero-cta animate-fade-up stagger-3">
            <button className="btn btn-gold hp-btn-lg" onClick={() => goTo("signup")}>
              <i className="bi bi-arrow-right-circle" /> Get Started
            </button>
            <button className="btn btn-ghost hp-btn-lg" onClick={() => goTo("login")}>
              <i className="bi bi-box-arrow-in-right" /> Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Feature Strip ─────────────────────────── */}
      <section className="hp-features">
        {[
          { icon: "bi-lightning-charge-fill", label: "Fast Ordering", color: "#e8881a" },
          { icon: "bi-truck", label: "Faculty Delivery", color: "#2563eb" },
          { icon: "bi-clock-history", label: "Live Tracking", color: "#34d399" },
          { icon: "bi-shield-check", label: "Secure Payments", color: "#a78bfa" },
        ].map(({ icon, label, color }) => (
          <div key={label} className="hp-feature-item">
            <i className={`bi ${icon}`} style={{ color }} />
            <span>{label}</span>
          </div>
        ))}
      </section>

      {/* ── User Type Cards ───────────────────────── */}
      <section className="hp-roles-section">
        <div className="hp-section-header">
          <span className="hp-section-tag">Who It's For</span>
          <h2 className="hp-section-title">Built For The FUOTUOKE Community</h2>
        </div>

        <div className="hp-roles-grid">
          <div className="hp-role-card hp-role-student">
            <div className="hp-role-icon-wrap hp-role-icon-student">
              <i className="bi bi-mortarboard-fill" />
            </div>
            <h3>Students</h3>
            <p>Browse the menu, place orders and track deliveries to your faculty in real time.</p>
            <button className="btn btn-primary btn-sm" onClick={() => goTo("signup")}>
              <i className="bi bi-arrow-right" /> Join Now
            </button>
          </div>
          <div className="hp-role-card hp-role-staff">
            <div className="hp-role-icon-wrap hp-role-icon-staff">
              <i className="bi bi-briefcase-fill" />
            </div>
            <h3>Staff</h3>
            <p>Priority ordering from all FUOTUOKE cafeterias with hassle-free pickup or delivery.</p>
            <button className="btn btn-gold btn-sm" onClick={() => goTo("signup")}>
              <i className="bi bi-arrow-right" /> Get Started
            </button>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────── */}
      <section className="hp-how-section">
        <div className="hp-section-header">
          <span className="hp-section-tag">How It Works</span>
          <h2 className="hp-section-title">Three Simple Steps</h2>
        </div>

        <div className="hp-steps-grid">
          {[
            { num: "01", icon: "bi-search", title: "Browse Menu", desc: "Explore meals from all campus canteens in one place." },
            { num: "02", icon: "bi-bag-check", title: "Place Order", desc: "Customise your meal, choose extras and checkout securely." },
            { num: "03", icon: "bi-geo-alt", title: "Pick Up or Deliver", desc: "Track your order live or pick up from the outlet." },
          ].map(({ num, icon, title, desc }) => (
            <div key={num} className="hp-step-card">
              <span className="hp-step-num">{num}</span>
              <div className="hp-step-icon">
                <i className={`bi ${icon}`} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Campus Outlets ────────────────────────── */}
      <section className="hp-outlets-section">
        <div className="hp-section-header">
          <span className="hp-section-tag">Where To Eat</span>
          <h2 className="hp-section-title">Campus Outlets</h2>
        </div>

        <div className="hp-outlets-grid">
          {OUTLETS.map(outlet => (
            <div key={outlet.id} className="hp-outlet-card">
              <div className="hp-outlet-icon">
                <i className={`bi ${outlet.biIcon}`} />
              </div>
              <div className="hp-outlet-info">
                <h4>{outlet.name}</h4>
                <span className="hp-outlet-loc">
                  <i className="bi bi-geo-alt" /> {outlet.loc}
                </span>
                <span className="hp-outlet-time">
                  <i className="bi bi-clock" /> {outlet.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* ── CTA Banner ────────────────────────────── */}
      <section className="hp-cta-banner">
        <div className="hp-cta-inner">
          <h2>Ready to order your next meal?</h2>
          <p>Join thousands of FUOTUOKE students and staff enjoying hassle free campus dining.</p>
          <div className="hp-cta-btns">
            <button className="btn btn-gold hp-btn-lg" onClick={() => goTo("signup")}>
              <i className="bi bi-rocket-takeoff" /> Create Account
            </button>
            <button className="btn btn-ghost hp-btn-lg" onClick={() => goTo("login")}>
              <i className="bi bi-box-arrow-in-right" /> Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="hp-footer">
        <div className="hp-footer-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div className="hp-footer-brand">
            <img
              src="/FUO_Logo.png"
              alt="FUOTUOKE"
              className="hp-footer-logo"
              loading="lazy"
              decoding="async"
            />
            <div>
              <div className="hp-footer-title">FUOTUOKE Campus Eats</div>
              <div className="hp-footer-motto">Knowledge · Excellence · Service</div>
            </div>
          </div>
          <div className="hp-footer-links" style={{ display: "flex", gap: 20 }}>
            <span style={{ cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: ".82rem", textDecoration: "underline" }} onClick={() => goTo("staff_login")}>
              Staff Portal
            </span>
          </div>
        </div>
        <div className="hp-footer-bottom">
          © {new Date().getFullYear()} FUOTUOKE Campus Eats · Federal University Otuoke, Bayelsa State
        </div>
      </footer>
    </div>
  );
}
