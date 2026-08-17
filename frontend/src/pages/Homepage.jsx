import React, { useState } from "react";
import { MENU, OUTLETS } from "../data";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' fill='%23222'%3E%3Crect width='400' height='225' fill='%231a1a1f'/%3E%3Ctext x='50%25' y='46%25' text-anchor='middle' fill='%23555' font-size='44' font-family='sans-serif'%3E🍲%3C/text%3E%3Ctext x='50%25' y='68%25' text-anchor='middle' fill='%23444' font-size='13' font-family='sans-serif'%3EFUOTUOKE Campus Eats%3C/text%3E%3C/svg%3E";

const getRating = (id) => {
  const ratings = [4.8, 4.5, 4.9, 4.6, 4.7, 4.9];
  return ratings[id % ratings.length];
};

const getPrepTime = (id) => {
  const times = ["15–20 min", "20–30 min", "10–15 min", "20–25 min", "15–25 min"];
  return times[id % times.length];
};

const getPrimaryImage = (item) => {
  if (item.images && item.images.length > 0) return item.images[0];
  return item.image || null;
};


export default function Homepage({ goTo }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [favs, setFavs] = useState({});

  const featuredMeals = MENU;

  const toggleFav = (e, id) => {
    e.stopPropagation();
    setFavs(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

      {/* ── Pure Food Cards Showcase (All Meals) ────── */}
      <section style={{ padding: "60px 5% 70px", background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, .05)" }}>
        <div className="hp-section-header" style={{ marginBottom: 32 }}>
          <span className="hp-section-tag" style={{ color: "var(--gold)" }}>
            <i className="bi bi-egg-fried" style={{ marginRight: 4 }} /> Campus Menu
          </span>
          <h2 className="hp-section-title">Explore All Foods & Drinks</h2>
        </div>

        {/* 4-Card Jumia Food Style Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          maxWidth: 1150,
          margin: "0 auto"
        }}>
          {featuredMeals.map(item => {
            const isFav = favs[item.id];
            const canteenName = OUTLETS.find(o => o.id === item.outletId)?.name || "FUOTUOKE Cafeteria";
            const rating = getRating(item.id);
            const prepTime = getPrepTime(item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMeal(item)}
                className="jf-card"
                style={{ cursor: "pointer" }}
              >
                {/* Primary Image */}
                <div className="jf-gallery-wrap">
                  {getPrimaryImage(item) ? (
                    <img
                      src={getPrimaryImage(item)}
                      alt={item.name}
                      className="jf-gallery-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = PLACEHOLDER_IMG;
                      }}
                    />
                  ) : (
                    <div className="jf-card-img-placeholder">
                      <span>{item.emoji || "🍲"}</span>
                    </div>
                  )}
                  <div className="jf-card-gradient" />
                  <button
                    className={`jf-heart-btn${isFav ? " active" : ""}`}
                    onClick={(e) => toggleFav(e, item.id)}
                    title={isFav ? "Remove from favorites" : "Save to favorites"}
                  >
                    <i className={`bi ${isFav ? "bi-heart-fill" : "bi-heart"}`} />
                  </button>
                  {item.popular && (
                    <span className="jf-popular-badge">
                      <i className="bi bi-fire" /> Popular
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="jf-card-body">
                  <div className="jf-title-price-row">
                    <h4 className="jf-card-title">{item.name}</h4>
                    <span className="jf-card-price" style={{ color: "var(--gold)" }}>
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="jf-canteen-name">
                    <i className="bi bi-shop" style={{ marginRight: 4 }} />
                    {canteenName}
                  </div>

                  <div className="jf-meta-row">
                    <span className="jf-meta-item jf-rating">
                      <i className="bi bi-star-fill" style={{ color: "#f59e0b" }} />
                      <strong>{rating.toFixed(1)}</strong>
                    </span>
                    <span className="jf-meta-dot">•</span>
                    <span className="jf-meta-item">
                      <i className="bi bi-clock-history" /> {prepTime}
                    </span>
                    <span className="jf-meta-dot">•</span>
                    <span className="jf-meta-item">
                      {item.cat}
                    </span>
                  </div>

                  <p className="jf-card-desc">{item.desc}</p>

                  <div className="jf-card-actions">
                    <button
                      className="jf-floating-add-btn staff"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMeal(item);
                      }}
                      title="Add item"
                    >
                      <i className="bi bi-plus-lg" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

      {/* ── Guest Login Prompt Modal ───────────────── */}
      {selectedMeal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3000,
          padding: 20
        }}>
          <div className="animate-scale-in" style={{
            background: "#18181b",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 20,
            maxWidth: 420,
            width: "100%",
            padding: "26px 28px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            color: "#fff"
          }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "rgba(232, 136, 26, 0.15)",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 12px",
                border: "1px solid rgba(232, 136, 26, 0.3)"
              }}>
                <i className="bi bi-lock-fill" />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 6 }}>
                Sign In to Order
              </h3>
              <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: ".86rem", lineHeight: 1.5, margin: 0 }}>
                Log in or create a FUOTUOKE Campus Eats account to customize options and place your order.
              </p>
            </div>

            {/* Meal summary */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 22
            }}>
              {selectedMeal.image ? (
                <img src={selectedMeal.image} alt={selectedMeal.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "1.8rem" }}>{selectedMeal.emoji || "🍲"}</span>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedMeal.name}
                </div>
                <div style={{ color: "var(--gold)", fontWeight: 800, fontSize: ".86rem" }}>
                  ₦{selectedMeal.price.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="btn btn-gold"
                onClick={() => goTo("login")}
                style={{ padding: "12px 0", width: "100%", fontSize: ".9rem", justifyContent: "center" }}
              >
                <i className="bi bi-box-arrow-in-right" /> Log In
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => goTo("signup")}
                style={{ padding: "12px 0", width: "100%", fontSize: ".9rem", justifyContent: "center", border: "1px solid rgba(255, 255, 255, 0.2)" }}
              >
                <i className="bi bi-person-plus" /> Create Account
              </button>
              <button
                onClick={() => setSelectedMeal(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.45)",
                  fontSize: ".82rem",
                  marginTop: 4,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
