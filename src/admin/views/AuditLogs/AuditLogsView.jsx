import React, { useState } from "react";

export default function AuditLogsView({ logs = [] }) {
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l => {
    return (
      String(l.user).toLowerCase().includes(search.toLowerCase()) ||
      String(l.action).toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="animate-fade-in" style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
        Platform Operations Logs
      </h3>
      <p style={{ color: "var(--text-light)", fontSize: ".88rem", marginBottom: 20 }}>
        Verify operational changes, administrator logins/logouts, and platform settings updates.
      </p>

      {/* Filter Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="Search logs by operator or action description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
              {["Timestamp", "Operator User", "Action Performed", "IP Address"].map(h => (
                <th key={h} style={{ padding: "10px", fontSize: ".76rem", fontWeight: 855, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, idx) => (
              <tr key={l.id || idx} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "#fff" : "var(--bg-main)" }}>
                <td style={{ padding: "12px 10px", fontSize: ".82rem", color: "var(--text-muted)" }}>
                  {l.date} — {l.time}
                </td>
                <td style={{ padding: "12px 10px", fontWeight: 700, fontSize: ".84rem" }}>
                  {l.user}
                </td>
                <td style={{ padding: "12px 10px", fontSize: ".86rem", color: "var(--text-dark)" }}>
                  {l.action}
                </td>
                <td style={{ padding: "12px 10px", fontSize: ".82rem", color: "var(--text-light)", fontFamily: "monospace" }}>
                  {l.ip || "127.0.0.1"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No audit log records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
