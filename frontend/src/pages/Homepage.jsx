import React, { useState, useMemo } from "react";
import { MENU, OUTLETS } from "../data";

const CATS = ["All", "Rice", "Soup", "Mains", "Snacks", "Drinks"];

export default function Homepage({ goTo }) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [authModalMeal, setAuthModalMeal] = useState(null);

  // Filter menu items live
  const filteredMenu = useMemo(() => {
    return MENU.filter(m => {
      const matchesCat = cat === "All" || m.cat === cat;
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.desc && m.desc.toLowerCase().includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [cat, search]);

  const scrollToMenu = () => {
    const el = document.getElementById("menu-showcase");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
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
          <button className="btn btn-ghost" onClick={scrollToMenu} style={{ marginRight: 6 }}>
            <i className="bi bi-journal-text" /> Browse Menu
          </button>
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
          <div className="hp-hero-badge animate-fade-up">
            <i className="bi bi-stars" /> FUOTUOKE Online Dining
          </div>

          <h1 className="hp-hero-title animate-fade-up stagger-1">
            Campus Food & Drinks,<br />
            <span className="hp-hero-highlight">On Your Schedule.</span>
          </h1>

          <p className="hp-hero-desc animate-fade-up stagger-2">
            Order freshly made meals and cold beverages from FUOTUOKE's canteens. Pickup or get
            delivered straight to your faculty — available to all students and staff.
          </p>

          <div className="hp-hero-cta animate-fade-up stagger-3">
            <button className="btn btn-gold hp-btn-lg" onClick={scrollToMenu}>
              <i className="bi bi-eye" /> Explore Menu
            </button>
            <button className="btn btn-ghost hp-btn-lg" onClick={() => goTo("signup")}>
              <i className="bi bi-arrow-right-circle" /> Get Started
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

      {/* ── Public Food & Drinks Menu Showcase ────── */}
      <section id="menu-showcase" className="hp-menu-section" style={{ padding: "70px 5% 80px", background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, .05)" }}>
        <div className="hp-section-header">
          <span className="hp-section-tag">
            <i className="bi bi-cup-straw" /> Campus Menu Showcase
          </span>
          <h2 className="hp-section-title">Explore Foods & Drinks</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: ".95rem", maxWidth: 620, margin: "10px auto 0", lineHeight: 1.6 }}>
            Browse delicious meals and refreshing beverages from all campus canteens. Log in or create an account to place an order.
          </p>
        </div>

        {/* Search & Category Filter bar */}
        <div style={{ maxWidth: 900, margin: "0 auto 36px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <i className="bi bi-search" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.4)", fontSize: "1rem" }} />
            <input
              type="text"
              placeholder="Search foods, soups, snacks, or cold drinks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                borderRadius: 50,
                background: "rgba(255, 255, 255, 0.07)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#fff",
                fontSize: ".95rem",
                outline: "none",
                transition: "all .2s ease"
              }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 30,
                  fontSize: ".84rem",
                  fontWeight: 600,
                  border: cat === c ? "1px solid var(--gold)" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: cat === c ? "var(--gold)" : "rgba(255, 255, 255, 0.05)",
                  color: cat === c ? "#000" : "rgba(255, 255, 255, 0.8)",
                  cursor: "pointer",
                  transition: "all .2s ease"
                }}
              >
                {c === "Drinks" && <i className="bi bi-cup-straw" style={{ marginRight: 6 }} />}
                {c === "Soup" && <i className="bi bi-bowl-hot" style={{ marginRight: 6 }} />}
                {c === "Rice" && <i className="bi bi-egg-fried" style={{ marginRight: 6 }} />}
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredMenu.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255, 255, 255, 0.5)" }}>
            <i className="bi bi-search" style={{ fontSize: "2.5rem", display: "block", marginBottom: 10, color: "var(--gold)" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>No items found</p>
            <p style={{ fontSize: ".9rem" }}>Try searching for another dish or select a different category.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 22,
            maxWidth: 1100,
            margin: "0 auto"
          }}>
            {filteredMenu.map(item => (
              <div
                key={item.id}
                onClick={() => setAuthModalMeal(item)}
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.09)",
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform .25s ease, border-color .25s ease, box-shadow .25s ease",
                  cursor: "pointer",
                }}
                className="hp-menu-card-hover"
              >
                <div style={{ position: "relative", height: 160, width: "100%", background: "#111" }}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "3.5rem" }}>
                      {item.emoji || "🍲"}
                    </div>
                  )}
                  {item.popular && (
                    <span style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "var(--gold)",
                      color: "#000",
                      fontSize: ".7rem",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 20,
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <i className="bi bi-star-fill" style={{ fontSize: ".65rem" }} /> Popular
                    </span>
                  )}
                  <span style={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    background: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(6px)",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: ".72rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.15)"
                  }}>
                    {item.cat}
                  </span>
                </div>

                <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h4 style={{ color: "#fff", fontSize: "1.02rem", fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
                    {item.name}
                  </h4>
                  <p style={{ color: "rgba(255, 255, 255, 0.55)", fontSize: ".82rem", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
                    {item.desc}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <span style={{ color: "var(--gold)", fontSize: "1.15rem", fontWeight: 800 }}>
                      ₦{item.price.toLocaleString()}
                    </span>
                    <button
                      className="btn btn-gold btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAuthModalMeal(item);
                      }}
                      style={{ borderRadius: 20, padding: "6px 14px", fontSize: ".8rem" }}
                    >
                      <i className="bi bi-cart-plus" style={{ marginRight: 4 }} /> Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* ── Guest Auth Requirement Modal ──────────────────────── */}
      {authModalMeal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div className="animate-scale-in" style={{
            background: "#18181b",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 20,
            maxWidth: 440,
            width: "100%",
            padding: "26px 28px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            color: "#fff"
          }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(232, 136, 26, 0.15)",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                margin: "0 auto 14px",
                border: "1px solid rgba(232, 136, 26, 0.3)"
              }}>
                <i className="bi bi-lock-fill" />
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 6 }}>
                Login Required to Order
              </h3>
              <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: ".88rem", lineHeight: 1.5, margin: 0 }}>
                Please sign in to your FUOTUOKE account or register to customize and place an order for:
              </p>
            </div>

            {/* Selected Meal Card Summary */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24
            }}>
              {authModalMeal.image ? (
                <img src={authModalMeal.image} alt={authModalMeal.name} style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "1.8rem" }}>{authModalMeal.emoji || "🍲"}</span>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: ".92rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {authModalMeal.name}
                </div>
                <div style={{ color: "var(--gold)", fontWeight: 800, fontSize: ".88rem" }}>
                  ₦{authModalMeal.price.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="btn btn-gold"
                onClick={() => goTo("login")}
                style={{ padding: "12px 0", width: "100%", fontSize: ".92rem", justifyContent: "center" }}
              >
                <i className="bi bi-box-arrow-in-right" /> Sign In to Order
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => goTo("signup")}
                style={{ padding: "12px 0", width: "100%", fontSize: ".92rem", justifyContent: "center", border: "1px solid rgba(255, 255, 255, 0.2)" }}
              >
                <i className="bi bi-person-plus" /> Create an Account
              </button>
              <button
                onClick={() => setAuthModalMeal(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.45)",
                  fontSize: ".82rem",
                  marginTop: 6,
                  cursor: "pointer"
                }}
              >
                Continue Browsing
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

