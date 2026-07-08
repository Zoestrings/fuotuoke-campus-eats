import React from "react";

export default function ReportsView({ stats = {}, orders = [], payments = [] }) {
  // Aggregate pickup vs delivery orders
  const pickupCount = orders.filter(o => o.type === "pickup").length;
  const deliveryCount = orders.filter(o => o.type === "delivery").length;

  // Aggregate orders by outlet name
  const outletAggregation = orders.reduce((acc, o) => {
    const name = o.outlet?.name || "Unknown Canteen";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
          Platform Analytics &amp; Reports
        </h3>
        <p style={{ color: "var(--text-light)", fontSize: ".88rem", marginBottom: 20 }}>
          Overview of platform growth, transactions, delivery demand, and canteen performance.
        </p>

        {/* Basic numbers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
          <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: 18, border: "1px solid var(--border)" }}>
            <span style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Volume</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--green-text)", marginTop: 6 }}>₦{stats.totalRevenue?.toLocaleString() || 0}</div>
          </div>
          <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: 18, border: "1px solid var(--border)" }}>
            <span style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Processed Orders</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-dark)", marginTop: 6 }}>{orders.length}</div>
          </div>
          <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: 18, border: "1px solid var(--border)" }}>
            <span style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Registered Customers</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-dark)", marginTop: 6 }}>{stats.userCount || 0}</div>
          </div>
          <div style={{ background: "var(--bg-main)", borderRadius: 10, padding: 18, border: "1px solid var(--border)" }}>
            <span style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Canteens Registered</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-dark)", marginTop: 6 }}>4</div>
          </div>
        </div>

        {/* Split charts layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Order types */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h4 style={{ fontWeight: 800, fontSize: ".9rem", marginBottom: 16, color: "var(--text-dark)" }}>Service Fulfilment Types</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", fontWeight: 700, marginBottom: 4 }}>
                  <span>Walk-in / Pickups</span>
                  <span>{pickupCount} ({orders.length ? Math.round((pickupCount/orders.length)*100) : 0}%)</span>
                </div>
                <div style={{ height: 8, background: "var(--bg-main)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${orders.length ? (pickupCount/orders.length)*100 : 0}%`, background: "var(--blue)" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", fontWeight: 700, marginBottom: 4 }}>
                  <span>Faculty Deliveries</span>
                  <span>{deliveryCount} ({orders.length ? Math.round((deliveryCount/orders.length)*100) : 0}%)</span>
                </div>
                <div style={{ height: 8, background: "var(--bg-main)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${orders.length ? (deliveryCount/orders.length)*100 : 0}%`, background: "var(--gold)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Canteen Shares */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h4 style={{ fontWeight: 800, fontSize: ".9rem", marginBottom: 16, color: "var(--text-dark)" }}>Canteen Order Share</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(outletAggregation).map(([name, count]) => {
                const percentage = orders.length ? Math.round((count/orders.length)*100) : 0;
                return (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".82rem" }}>
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    <span style={{ color: "var(--text-light)", fontWeight: 700 }}>{count} orders ({percentage}%)</span>
                  </div>
                );
              })}
              {Object.keys(outletAggregation).length === 0 && (
                <div style={{ fontSize: ".8rem", color: "var(--text-light)", textAlign: "center" }}>No canteen order distributions available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
