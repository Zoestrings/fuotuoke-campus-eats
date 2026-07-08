import React from "react";

export default function PricingManagement({ menuItems = [], selectedOutlet }) {
  return (
    <div className="animate-fade-in" style={{ background: "#fffdf9", borderRadius: 14, padding: 24, border: "1px solid #e8e4dc" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
        <i className="bi bi-tags-fill" style={{ marginRight: 8, color: "var(--gold)" }} />
        Pricing List
      </h3>
      <p style={{ color: "var(--text-light)", fontSize: ".88rem", marginBottom: 20 }}>
        A quick overview of all dish prices in the canteen menu. To adjust pricing, remove and re-add the dish via the Manage Menu tab.
      </p>

      {menuItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-light)" }}>
          <i className="bi bi-tags" style={{ fontSize: "2.5rem", display: "block", marginBottom: 12, color: "var(--text-muted)" }} />
          No items in menu yet.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: ".78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Dish</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: ".78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Category</th>
              <th style={{ textAlign: "right", padding: "10px 8px", fontSize: ".78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Base Price</th>
              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: ".78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Popular</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "#fff" : "var(--bg-main)" }}>
                <td style={{ padding: "12px 8px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>{item.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: ".88rem", color: "var(--text-dark)" }}>{item.name}</div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-light)" }}>{item.desc?.slice(0, 40)}...</div>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <span className="badge badge-blue" style={{ fontSize: ".7rem" }}>{item.cat}</span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 800, color: "var(--gold)", fontSize: ".9rem" }}>
                  ₦{item.price.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px" }}>
                  {item.popular ? (
                    <span style={{ color: "var(--green-text)", fontWeight: 600, fontSize: ".8rem" }}>
                      <i className="bi bi-star-fill" style={{ marginRight: 4 }} /> Yes
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
