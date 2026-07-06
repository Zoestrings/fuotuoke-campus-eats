import React from "react";
import { Badge } from "../../../shared/ui";

export default function CategoriesManagement({ menuItems = [] }) {
  // Count items per category
  const categoriesCount = {};
  menuItems.forEach(item => {
    categoriesCount[item.cat] = (categoriesCount[item.cat] || 0) + 1;
  });

  return (
    <div className="page-bg animate-fade-in" style={{ background: "#fffdf9", borderRadius: 14, padding: 24, border: "1px solid #e8e4dc" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 16 }}>
        <i className="bi bi-tags" style={{ marginRight: 8, color: "var(--gold)" }} />
        Menu Categories Overview
      </h3>
      <p style={{ color: "var(--text-light)", fontSize: ".88rem", marginBottom: 24 }}>
        Check category distribution of active dishes in your canteen menu list.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {Object.entries(categoriesCount).map(([catName, count]) => (
          <div
            key={catName}
            style={{
              padding: 20,
              borderRadius: 12,
              background: "var(--bg-main)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}
          >
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-dark)" }}>{catName}</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: ".82rem", color: "var(--text-light)" }}>Listed Meals</span>
              <Badge color="gold">{count} items</Badge>
            </div>
          </div>
        ))}
        {Object.keys(categoriesCount).length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 24, color: "var(--text-light)" }}>
            No dishes listed yet. Add items to see category statistics.
          </div>
        )}
      </div>
    </div>
  );
}
