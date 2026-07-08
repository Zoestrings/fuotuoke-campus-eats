import React from "react";

export default function ReportsView({ orders = [], stats }) {
  const dailyData = orders.reduce((acc, o) => {
    const date = o.time ? "Today" : "Recent";
    if (!acc[date]) acc[date] = { count: 0, revenue: 0 };
    acc[date].count += 1;
    acc[date].revenue += o.status === "Completed" ? o.total : 0;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {[
          { label: "Total Revenue", value: `₦${stats.totalRevenue.toLocaleString()}`, icon: "bi-cash-coin", color: "var(--green-text)" },
          { label: "Total Orders", value: orders.length, icon: "bi-receipt", color: "var(--primary)" },
          { label: "Active Orders", value: stats.activeCount, icon: "bi-lightning-fill", color: "var(--gold)" },
          { label: "Completed", value: stats.completedCount, icon: "bi-check-all", color: "var(--text-dark)" }
        ].map(card => (
      <div style={{ background: "#fffdf9", borderRadius: 14, padding: 24, border: "1px solid #e8e4dc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{card.label}</span>
              <i className={`bi ${card.icon}`} style={{ color: card.color, fontSize: "1.2rem" }} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Top Selling Section */}
      <div style={{ background: "#fffdf9", borderRadius: 14, padding: 24, border: "1px solid #e8e4dc" }}>
        <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="bi bi-bar-chart-fill" style={{ color: "var(--gold)" }} /> Best Selling Dishes
        </h4>
        {stats.topSelling.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stats.topSelling.map(([name, count], i) => {
              const maxCount = stats.topSelling[0][1];
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".86rem", fontWeight: 600, marginBottom: 4 }}>
                    <span>{i + 1}. {name}</span>
                    <span style={{ color: "var(--gold)" }}>{count} sold</span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? "var(--gold)" : i === 1 ? "var(--primary)" : "var(--text-muted)", borderRadius: 3, transition: "width .6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--text-light)", fontSize: ".86rem" }}>No sales data yet. Orders will appear here when placed.</p>
        )}
      </div>

      {/* Recent Completed Orders Table */}
      <div style={{ background: "#fffdf9", borderRadius: 14, padding: 24, border: "1px solid #e8e4dc" }}>
        <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="bi bi-receipt" style={{ color: "var(--primary)" }} /> Completed Orders Log
        </h4>
        {orders.filter(o => o.status === "Completed").length === 0 ? (
          <p style={{ color: "var(--text-light)", fontSize: ".86rem" }}>No completed orders to display yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                {["Order ID", "Time", "Type", "Items", "Total"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: ".75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.filter(o => o.status === "Completed").map((order, i) => (
                <tr key={order.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "#fff" : "var(--bg-main)" }}>
                  <td style={{ padding: "10px", fontSize: ".84rem", fontWeight: 700, color: "var(--text-dark)" }}>#{String(order.id).slice(-5)}</td>
                  <td style={{ padding: "10px", fontSize: ".82rem", color: "var(--text-light)" }}>{order.time}</td>
                  <td style={{ padding: "10px" }}>
                    <span className={`badge ${order.type === "pickup" ? "badge-blue" : "badge-gold"}`} style={{ fontSize: ".7rem" }}>
                      {order.type === "pickup" ? "Pickup" : "Delivery"}
                    </span>
                  </td>
                  <td style={{ padding: "10px", fontSize: ".82rem", color: "var(--text-dark)" }}>{order.items.length} item(s)</td>
                  <td style={{ padding: "10px", fontWeight: 800, color: "var(--green-text)", fontSize: ".88rem" }}>₦{order.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
