import React, { useState } from "react";

export default function TopNav({ user, page, setPage, cartCount, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isStaff = user.isStaff || user.role === "staff";

  const navLinks = [
    { key: "home",   icon: "bi-house-door",       label: "Home"    },
    { key: "menu",   icon: "bi-grid",              label: "Menu"    },
    { key: "cart",   icon: "bi-cart3",             label: "Cart"    },
    { key: "orders", icon: "bi-receipt",           label: "Orders"  },
  ];

  return (
    <nav className={`navbar${isStaff ? " staff" : ""}`}>
      {/* Brand */}
      <div className="nav-brand">
        <img src="/FUO_Logo.png" alt="Logo" className="nav-brand-img" style={{ width: 34, height: 34, objectFit: "contain" }} />
        <div>
          <div className="nav-brand-title">FUOTUOKE Campus Eats</div>
          <div className="nav-brand-subtitle">Federal University Otuoke</div>
        </div>
      </div>

      {/* Links */}
      <div className="nav-links">
        {navLinks.map(({ key, icon, label }) => (
          <button
            key={key}
            className={`nav-btn${page === key ? ` active${isStaff ? " staff" : ""}` : ""}`}
            onClick={() => setPage(key)}
          >
            <i className={`bi ${icon}`} style={{ fontSize: "1rem" }} />
            {label}
            {key === "cart" && cartCount > 0 && (
              <span className="nav-badge">{cartCount}</span>
            )}
          </button>
        ))}

        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.12)", margin: "0 4px" }} />

        {/* User pill */}
        <div className="nav-user-info">
          <i className={`bi ${isStaff ? "bi-briefcase" : "bi-person-circle"}`} style={{ fontSize: "1rem", color: isStaff ? "var(--gold)" : "var(--primary)", opacity: 0.9 }} />
          <span className="nav-user-name">{user.name?.split(" ")[0] || "User"}</span>
          <span className="nav-user-role-badge" style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>
            {user.role}
          </span>
        </div>

        {/* Logout */}
        <div style={{ position: "relative" }}>
          <button
            className="nav-btn"
            onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
            style={{ gap: 6 }}
          >
            <i className="bi bi-box-arrow-right" style={{ fontSize: "1rem" }} />
            Logout
          </button>

          {showLogoutConfirm && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,.22)", zIndex: 1000, minWidth: 230, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--text-dark)", margin: 0 }}>Sign out?</p>
                <p style={{ fontSize: ".78rem", color: "var(--text-light)", margin: "4px 0 0" }}>You'll need to log in again to order.</p>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "12px 14px" }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowLogoutConfirm(false); onLogout(); }}
                  className="btn btn-danger btn-sm"
                  style={{ flex: 1 }}
                >
                  <i className="bi bi-box-arrow-right" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
