import React, { useState } from "react";
import { Btn, Badge } from "../components/ui";

const DEMO_RIDERS = [
  { id: 1, name: "Samuel Ojo", phone: "080-1234-5678", status: "online", deliveries: 45, rating: 4.8, zone: "Admin Block" },
  { id: 2, name: "Peter Obi", phone: "090-8765-4321", status: "online", deliveries: 32, rating: 4.5, zone: "Engineering" },
  { id: 3, name: "John Ugwu", phone: "070-5555-1234", status: "offline", deliveries: 12, rating: 3.9, zone: "Science Block" },
  { id: 4, name: "Mary Adamu", phone: "081-4444-7890", status: "on_delivery", deliveries: 28, rating: 4.7, zone: "SUB Complex" },
  { id: 5, name: "Isaac Nwankwo", phone: "090-2222-3333", status: "online", deliveries: 55, rating: 4.9, zone: "Admin Block" },
];

export default function DeliveryAdminDashboard({ user, onLogout, orders = [], setOrders }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const deliveryOrders = orders.filter(o => o.type === "delivery");
  const activeDeliveries = deliveryOrders.filter(o => o.status === "Out for Delivery");
  const pendingAssignment = deliveryOrders.filter(o => (o.status || "Received") === "Received" || o.status === "Preparing");
  const completedDeliveries = deliveryOrders.filter(o => o.status === "Completed");
  const totalDeliveryRevenue = deliveryOrders.reduce((s, o) => s + o.total, 0);
  const onlineRiders = DEMO_RIDERS.filter(r => r.status === "online" || r.status === "on_delivery").length;

  const stats = [
    { label: "Active Deliveries", value: activeDeliveries.length, sub: "Currently in transit", icon: "bi-truck", color: "blue" },
    { label: "Pending Assignment", value: pendingAssignment.length, sub: "Needs a rider", icon: "bi-hourglass-split", color: "gold" },
    { label: "Riders Online", value: `${onlineRiders}/${DEMO_RIDERS.length}`, sub: "Available for dispatch", icon: "bi-bicycle", color: "green" },
    { label: "Delivery Revenue", value: `₦${totalDeliveryRevenue.toLocaleString()}`, sub: `${deliveryOrders.length} delivery orders`, icon: "bi-cash-coin", color: "blue" },
  ];

  const navItems = [
    { id: "overview", icon: "bi-grid-1x2-fill", label: "Overview" },
    { id: "active", icon: "bi-truck", label: "Active Deliveries" },
    { id: "riders", icon: "bi-bicycle", label: "Riders" },
    { id: "history", icon: "bi-clock-history", label: "History" },
  ];

  const assignRider = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Out for Delivery", rider: DEMO_RIDERS[Math.floor(Math.random() * 2)].name } : o));
    alert("✅ Rider assigned successfully!");
  };

  const completeDelivery = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Completed" } : o));
  };

  const riderStatusLabel = (s) => {
    if (s === "online") return { text: "Online", cls: "active" };
    if (s === "on_delivery") return { text: "On Delivery", cls: "pending" };
    return { text: "Offline", cls: "inactive" };
  };

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar-overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`admin-sidebar delivery${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar-brand">
          <img src="/FUO_Logo.png" alt="Logo" />
          <div className="admin-sidebar-brand-text">
            <h3>Campus Eats</h3>
            <span className="dlvr">Delivery Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-section">Dashboard</div>
          {navItems.map(item => (
            <button key={item.id} className={`admin-nav-item${activeTab === item.id ? " active delivery" : ""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-user-avatar dlvr">{(user.name || "DA").slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="admin-user-name">{user.name || "Delivery Admin"}</div>
              <div className="admin-user-role">Delivery Operations</div>
            </div>
          </div>
          <Btn full variant="danger" sm onClick={onLogout}>
            <i className="bi bi-box-arrow-right" /> Sign Out
          </Btn>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="bi bi-list" />
            </button>
            <div className="admin-topbar-left">
              <h1><i className="bi bi-truck" style={{ color: "#3b82f6" }} /> Delivery Operations</h1>
              <p>Manage riders, track deliveries, assign orders</p>
            </div>
          </div>
          <Badge color="blue"><i className="bi bi-bicycle" /> Delivery Admin</Badge>
        </div>

        <div className="admin-content">
          {/* Overview */}
          {activeTab === "overview" && (
            <>
              <div className="admin-stats-grid">
                {stats.map(s => (
                  <div key={s.label} className="admin-stat-card">
                    <div>
                      <div className="admin-stat-label">{s.label}</div>
                      <div className="admin-stat-value">{s.value}</div>
                      <div className="admin-stat-sub">{s.sub}</div>
                    </div>
                    <div className={`admin-stat-icon ${s.color}`}><i className={`bi ${s.icon}`} /></div>
                  </div>
                ))}
              </div>

              <div className="admin-grid-2">
                {/* Pending Assignment */}
                <div className="admin-table-card">
                  <div className="admin-table-header">
                    <div className="admin-table-title"><i className="bi bi-hourglass-split" /> Pending Assignment <span className="count">{pendingAssignment.length}</span></div>
                  </div>
                  {pendingAssignment.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                      <i className="bi bi-check-circle" style={{ fontSize: "2rem", display: "block", marginBottom: 8, color: "var(--green)" }} />
                      All delivery orders assigned!
                    </div>
                  ) : (
                    <div>
                      {pendingAssignment.slice(0, 5).map(o => (
                        <div key={o.id} style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontWeight: 800 }}>#{String(o.id).slice(-5)}</span>
                            <span className="admin-table-status pending">{o.status || "Received"}</span>
                          </div>
                          <div style={{ fontSize: ".82rem", color: "var(--text-light)", marginBottom: 8 }}>
                            <i className="bi bi-geo-alt" style={{ marginRight: 4 }} />{o.faculty || "Campus"} · {o.items.length} items · ₦{o.total.toLocaleString()}
                          </div>
                          <Btn sm variant="primary" onClick={() => assignRider(o.id)}>
                            <i className="bi bi-person-plus" /> Assign Rider
                          </Btn>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Online Riders */}
                <div className="admin-table-card">
                  <div className="admin-table-header">
                    <div className="admin-table-title"><i className="bi bi-bicycle" /> Online Riders <span className="count">{onlineRiders}</span></div>
                  </div>
                  <div>
                    {DEMO_RIDERS.filter(r => r.status !== "offline").map(r => {
                      const st = riderStatusLabel(r.status);
                      return (
                        <div key={r.id} style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: ".88rem" }}>{r.name}</div>
                            <div style={{ fontSize: ".76rem", color: "var(--text-light)" }}>{r.zone} · <i className="bi bi-star-fill" style={{ color: "var(--gold)", fontSize: ".65rem" }} /> {r.rating}</div>
                          </div>
                          <span className={`admin-table-status ${st.cls}`}>{st.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Active Deliveries */}
          {activeTab === "active" && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div className="admin-table-title"><i className="bi bi-truck" /> Active Deliveries <span className="count">{activeDeliveries.length}</span></div>
              </div>
              {activeDeliveries.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                  <i className="bi bi-truck" style={{ fontSize: "3rem", display: "block", marginBottom: 12 }} />
                  <p style={{ fontWeight: 700 }}>No active deliveries</p>
                  <p style={{ fontSize: ".82rem" }}>Deliveries in transit will appear here</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Order</th><th>Destination</th><th>Items</th><th>Total</th><th>Rider</th><th>Action</th></tr></thead>
                  <tbody>
                    {activeDeliveries.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700 }}>#{String(o.id).slice(-5)}</td>
                        <td>{o.faculty || "Campus"}</td>
                        <td>{o.items.length} items</td>
                        <td style={{ fontWeight: 700 }}>₦{o.total.toLocaleString()}</td>
                        <td>{o.rider || "Auto-assigned"}</td>
                        <td>
                          <Btn sm variant="primary" onClick={() => completeDelivery(o.id)}>
                            <i className="bi bi-check-circle" /> Complete
                          </Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Riders Tab */}
          {activeTab === "riders" && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div className="admin-table-title"><i className="bi bi-bicycle" /> All Riders <span className="count">{DEMO_RIDERS.length}</span></div>
              </div>
              <table className="admin-table">
                <thead><tr><th>Rider</th><th>Phone</th><th>Zone</th><th>Deliveries</th><th>Rating</th><th>Status</th></tr></thead>
                <tbody>
                  {DEMO_RIDERS.map(r => {
                    const st = riderStatusLabel(r.status);
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700 }}>{r.name}</td>
                        <td style={{ fontFamily: "monospace" }}>{r.phone}</td>
                        <td>{r.zone}</td>
                        <td>{r.deliveries}</td>
                        <td><i className="bi bi-star-fill" style={{ color: "var(--gold)", marginRight: 4, fontSize: ".72rem" }} />{r.rating}</td>
                        <td><span className={`admin-table-status ${st.cls}`}>{st.text}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div className="admin-table-title"><i className="bi bi-clock-history" /> Delivery History <span className="count">{completedDeliveries.length}</span></div>
              </div>
              {completedDeliveries.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                  <i className="bi bi-clock-history" style={{ fontSize: "3rem", display: "block", marginBottom: 12 }} />
                  <p style={{ fontWeight: 700 }}>No delivery history</p>
                  <p style={{ fontSize: ".82rem" }}>Completed deliveries will appear here</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Order</th><th>Destination</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {completedDeliveries.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700 }}>#{String(o.id).slice(-5)}</td>
                        <td>{o.faculty || "Campus"}</td>
                        <td>{o.items.length} items</td>
                        <td style={{ fontWeight: 700 }}>₦{o.total.toLocaleString()}</td>
                        <td><span className="admin-table-status active">Delivered</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
