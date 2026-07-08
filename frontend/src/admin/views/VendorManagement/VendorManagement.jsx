import React from "react";
import { Badge } from "../../../shared/ui";
import { OUTLETS } from "../../../data";

export default function VendorManagement({ users = [] }) {
  const vendors = users.filter(u => u.role === "kitchen");

  return (
    <div className="animate-fade-in" style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
        Canteen Outlet &amp; Vendor Management
      </h3>
      <p style={{ color: "var(--text-light)", fontSize: ".88rem", marginBottom: 20 }}>
        Monitor campus cafeterias and their assigned kitchen provider accounts.
      </p>

      {/* Outlet configurations */}
      <h4 style={{ fontSize: ".84rem", fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14, marginTop: 24 }}>
        Platform Cafeterias
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
        {OUTLETS.map(o => {
          const manager = vendors.find(v => v.canteen === o.name);
          return (
            <div key={o.id} style={{ padding: 18, background: "var(--bg-main)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-dark)" }}>{o.name}</span>
                <i className={`bi ${o.biIcon || "bi-shop"}`} style={{ fontSize: "1.2rem", color: "var(--primary)" }} />
              </div>
              <div style={{ fontSize: ".8rem", color: "var(--text-light)", display: "flex", flexDirection: "column", gap: 4 }}>
                <div><i className="bi bi-geo-alt" style={{ marginRight: 6 }} />{o.loc}</div>
                <div><i className="bi bi-clock" style={{ marginRight: 6 }} />{o.time}</div>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--border)", fontWeight: 600 }}>
                  <i className="bi bi-person-circle" style={{ marginRight: 6 }} />
                  Manager: {manager ? manager.name : <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>No active account</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active kitchen staff accounts */}
      <h4 style={{ fontSize: ".84rem", fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>
        Kitchen Staff Credentials
      </h4>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
              {["Kitchen ID", "Name", "Assigned Outlet", "Email", "Status"].map(h => (
                <th key={h} style={{ padding: "10px", fontSize: ".76rem", fontWeight: 850, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.map((v, idx) => (
              <tr key={v.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "#fff" : "var(--bg-main)" }}>
                <td style={{ padding: "12px 10px", fontWeight: 700, fontSize: ".86rem" }}>{v.id}</td>
                <td style={{ padding: "12px 10px", fontSize: ".86rem" }}>{v.name}</td>
                <td style={{ padding: "12px 10px", fontSize: ".86rem", fontWeight: 600, color: "var(--primary)" }}>{v.canteen || "Unassigned"}</td>
                <td style={{ padding: "12px 10px", fontSize: ".82rem", color: "var(--text-light)" }}>{v.email}</td>
                <td style={{ padding: "12px 10px" }}>
                  <Badge color={v.status === "active" ? "green" : "gold"}>
                    {v.status === "active" ? "Active" : "Suspended"}
                  </Badge>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No kitchen accounts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
