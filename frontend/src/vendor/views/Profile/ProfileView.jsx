import React from "react";
import { OUTLETS } from "../../../data";

export default function ProfileView({ selectedOutlet }) {
  const outlet = OUTLETS.find(o => o.name === selectedOutlet) || {};

  return (
    <div className="animate-fade-in" style={{ background: "#fffdf9", borderRadius: 14, padding: 24, border: "1px solid #e8e4dc" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>
        <i className="bi bi-shop" style={{ marginRight: 8, color: "var(--gold)" }} />
        Canteen Profile
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          { label: "Canteen Name", value: outlet.name || selectedOutlet, icon: "bi-building" },
          { label: "Location", value: outlet.loc || "Campus", icon: "bi-geo-alt" },
          { label: "Operating Hours", value: outlet.time || "—", icon: "bi-clock" },
          { label: "Status", value: "Active", icon: "bi-check-circle-fill" }
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ padding: 16, background: "var(--bg-main)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className={`bi ${icon}`} style={{ color: "var(--gold)" }} />
              <span style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</span>
            </div>
            <div style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text-dark)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: 16, background: "var(--gold-light)", borderRadius: 10, border: "1px solid var(--border)" }}>
        <p style={{ fontSize: ".82rem", color: "var(--gold-text)", fontWeight: 600 }}>
          <i className="bi bi-info-circle-fill" style={{ marginRight: 6 }} />
          To update canteen details (name, location, operating hours), please contact the System Administrator.
        </p>
      </div>
    </div>
  );
}
