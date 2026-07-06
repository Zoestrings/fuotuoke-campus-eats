import React, { useState } from "react";
import { Btn, Badge } from "../../../shared/ui";

export default function MenuManagement({ menuItems = [], onDelete }) {
  const [search, setSearch] = useState("");

  const filtered = menuItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", margin: 0 }}>
            Global Menu Management
          </h3>
          <p style={{ color: "var(--text-light)", fontSize: ".88rem", margin: "4px 0 0" }}>
            Monitor and clean up the list of dishes offered by canteens across campus.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "20px 0", flexWrap: "wrap" }}>
        <input
          className="form-input"
          placeholder="Search by dish name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
              {["Dish Details", "Category", "Price", "Tags", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px", fontSize: ".76rem", fontWeight: 850, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "#fff" : "var(--bg-main)" }}>
                <td style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: "1.5rem" }}>{item.emoji}</div>
                  {item.image && (
                    <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 750, fontSize: ".88rem", color: "var(--text-dark)" }}>{item.name}</div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-light)" }}>{item.desc}</div>
                  </div>
                </td>
                <td style={{ padding: "12px 10px" }}>
                  <span className="badge badge-blue" style={{ fontSize: ".72rem" }}>{item.cat}</span>
                </td>
                <td style={{ padding: "12px 10px", fontWeight: 800, color: "var(--primary)", fontSize: ".88rem" }}>
                  ₦{item.price.toLocaleString()}
                </td>
                <td style={{ padding: "12px 10px" }}>
                  {item.popular ? <Badge color="gold">Popular</Badge> : <span style={{ color: "var(--text-muted)", fontSize: ".76rem" }}>—</span>}
                </td>
                <td style={{ padding: "12px 10px" }}>
                  <Btn sm variant="danger" onClick={() => onDelete(item.id, item.name)}>
                    Remove
                  </Btn>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No menu items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
