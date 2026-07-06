import React, { useState } from "react";
import { OUTLETS, MENU } from "../data";
import { Btn, Badge } from "../components/ui";

const DEMO_USERS = [
  { id: 1, name: "Emeka Okafor", role: "student", matric: "FUO/22/CSI/18842", status: "active", orders: 12 },
  { id: 2, name: "Chioma Eze", role: "student", matric: "FUO/23/BIO/10044", status: "active", orders: 8 },
  { id: 3, name: "Ahmed Bello", role: "staff", matric: "FUO-STAFF-0042", status: "active", orders: 5 },
  { id: 4, name: "Grace Adeyemi", role: "kitchen", matric: "FUO-KIT-0012", status: "active", orders: 0 },
  { id: 5, name: "Tunde Bakare", role: "student", matric: "FUO/21/ENG/20015", status: "inactive", orders: 3 },
  { id: 6, name: "Fatima Usman", role: "restaurant", matric: "FUO-REST-0005", status: "active", orders: 0 },
];

const DEMO_RESTAURANTS = [
  { id: 1, name: "Main Cafeteria", admin: "Fatima Usman", status: "active", items: 12, revenue: 145000, orders: 67 },
  { id: 2, name: "Engineering Canteen", admin: "Kola Ogun", status: "active", items: 8, revenue: 89000, orders: 34 },
  { id: 3, name: "Student Union Buka", admin: "Blessing Ike", status: "pending", items: 0, revenue: 0, orders: 0 },
  { id: 4, name: "Science Cafeteria", admin: "David Nwachukwu", status: "active", items: 10, revenue: 62000, orders: 28 },
];

const DEMO_RIDERS = [
  { id: 1, name: "Samuel Ojo", phone: "080-1234-5678", status: "active", deliveries: 45, rating: 4.8 },
  { id: 2, name: "Peter Obi", phone: "090-8765-4321", status: "active", deliveries: 32, rating: 4.5 },
  { id: 3, name: "John Ugwu", phone: "070-5555-1234", status: "inactive", deliveries: 12, rating: 3.9 },
];

export default function SuperAdminDashboard({ user, onLogout, orders = [], menuItems = [] }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter(o => (o.status || "Received") !== "Completed").length;
  const completedOrders = orders.filter(o => o.status === "Completed").length;

  const stats = [
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, sub: `${orders.length} total orders`, icon: "bi-cash-coin", color: "purple" },
    { label: "Active Orders", value: activeOrders, sub: "Needs attention", icon: "bi-lightning-fill", color: "gold" },
    { label: "Registered Users", value: DEMO_USERS.length, sub: `${DEMO_USERS.filter(u => u.role === "student").length} students`, icon: "bi-people-fill", color: "blue" },
    { label: "Restaurants", value: DEMO_RESTAURANTS.length, sub: `${DEMO_RESTAURANTS.filter(r => r.status === "active").length} active`, icon: "bi-shop", color: "green" },
    { label: "Menu Items", value: menuItems.length, sub: "Across all outlets", icon: "bi-egg-fried", color: "gold" },
    { label: "Delivery Riders", value: DEMO_RIDERS.length, sub: `${DEMO_RIDERS.filter(r => r.status === "active").length} online`, icon: "bi-bicycle", color: "blue" },
  ];

  const navItems = [
    { id: "overview", icon: "bi-grid-1x2-fill", label: "Overview" },
    { id: "users", icon: "bi-people-fill", label: "Users" },
    { id: "restaurants", icon: "bi-shop", label: "Restaurants" },
    { id: "orders", icon: "bi-receipt", label: "All Orders" },
    { id: "riders", icon: "bi-bicycle", label: "Delivery Riders" },
    { id: "settings", icon: "bi-gear-fill", label: "Settings" },
  ];

  const recentActivity = [
    { text: "New student Emeka Okafor registered", time: "2m ago", color: "blue" },
    { text: "Order #38842 completed at Main Cafeteria", time: "8m ago", color: "green" },
    { text: "Restaurant 'Student Union Buka' pending approval", time: "15m ago", color: "gold" },
    { text: "Delivery rider Samuel Ojo completed 5 deliveries", time: "32m ago", color: "purple" },
    { text: "Menu item 'Pepper Soup' added to Engr. Canteen", time: "1h ago", color: "green" },
  ];

  const tabTitles = {
    overview: { title: "Platform Overview", desc: "Monitor your entire campus food ecosystem" },
    users: { title: "User Management", desc: "Manage students, staff, and admin accounts" },
    restaurants: { title: "Restaurant Management", desc: "Oversee all campus food outlets" },
    orders: { title: "Order History", desc: "Track all orders across the platform" },
    riders: { title: "Delivery Riders", desc: "Manage campus delivery personnel" },
    settings: { title: "System Settings", desc: "Configure platform-wide preferences" },
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      <div className={`admin-sidebar-overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar superadmin${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar-brand">
          <img src="/FUO_Logo.png" alt="Logo" />
          <div className="admin-sidebar-brand-text">
            <h3>Campus Eats</h3>
            <span className="super">Super Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-section">Main</div>
          {navItems.slice(0, 4).map(item => (
            <button key={item.id} className={`admin-nav-item${activeTab === item.id ? " active" : ""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
          <div className="admin-sidebar-section">Operations</div>
          {navItems.slice(4).map(item => (
            <button key={item.id} className={`admin-nav-item${activeTab === item.id ? " active" : ""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-user-avatar super">{(user.name || "SA").slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="admin-user-name">{user.name || "Super Admin"}</div>
              <div className="admin-user-role">Platform Administrator</div>
            </div>
          </div>
          <Btn full variant="danger" sm onClick={onLogout}>
            <i className="bi bi-box-arrow-right" /> Sign Out
          </Btn>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="bi bi-list" />
            </button>
            <div className="admin-topbar-left">
              <h1><i className="bi bi-shield-fill-check" style={{ color: "#8b5cf6" }} /> {tabTitles[activeTab]?.title}</h1>
              <p>{tabTitles[activeTab]?.desc}</p>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <Badge color="gold"><i className="bi bi-shield-fill" /> Super Admin</Badge>
          </div>
        </div>

        <div className="admin-content">
          {/* Overview Tab */}
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

              <div className="admin-grid-3">
                <div className="admin-table-card">
                  <div className="admin-table-header">
                    <div className="admin-table-title"><i className="bi bi-clock-history" /> Recent Orders</div>
                  </div>
                  {orders.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: ".86rem" }}>
                      <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
                      No orders yet
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead><tr><th>Order</th><th>Outlet</th><th>Total</th><th>Status</th></tr></thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 700 }}>#{String(o.id).slice(-5)}</td>
                            <td>{o.outlet?.name || "—"}</td>
                            <td>₦{o.total.toLocaleString()}</td>
                            <td>
                              <span className={`admin-table-status ${(o.status || "Received") === "Completed" ? "active" : "pending"}`}>
                                {o.status || "Received"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="admin-table-card">
                  <div className="admin-table-header">
                    <div className="admin-table-title"><i className="bi bi-activity" /> Activity</div>
                  </div>
                  <div className="admin-activity-list">
                    {recentActivity.map((a, i) => (
                      <div key={i} className="admin-activity-item">
                        <div className={`admin-activity-dot ${a.color}`} />
                        <span className="admin-activity-text">{a.text}</span>
                        <span className="admin-activity-time">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div className="admin-table-title">
                  <i className="bi bi-people-fill" /> All Users <span className="count">{DEMO_USERS.length}</span>
                </div>
              </div>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Role</th><th>ID</th><th>Orders</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {DEMO_USERS.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td><Badge color={u.role === "student" ? "blue" : "gold"}>{u.role}</Badge></td>
                      <td style={{ fontFamily: "monospace", fontSize: ".78rem" }}>{u.matric}</td>
                      <td>{u.orders}</td>
                      <td><span className={`admin-table-status ${u.status}`}>{u.status}</span></td>
                      <td><button className="admin-table-action"><i className="bi bi-three-dots" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Restaurants Tab */}
          {activeTab === "restaurants" && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div className="admin-table-title">
                  <i className="bi bi-shop" /> Restaurants <span className="count">{DEMO_RESTAURANTS.length}</span>
                </div>
              </div>
              <table className="admin-table">
                <thead><tr><th>Restaurant</th><th>Admin</th><th>Items</th><th>Revenue</th><th>Orders</th><th>Status</th></tr></thead>
                <tbody>
                  {DEMO_RESTAURANTS.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>{r.name}</td>
                      <td>{r.admin}</td>
                      <td>{r.items}</td>
                      <td style={{ fontWeight: 700, color: "var(--green-text)" }}>₦{r.revenue.toLocaleString()}</td>
                      <td>{r.orders}</td>
                      <td><span className={`admin-table-status ${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div className="admin-table-title">
                  <i className="bi bi-receipt" /> All Orders <span className="count">{orders.length}</span>
                </div>
              </div>
              {orders.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                  <i className="bi bi-inbox" style={{ fontSize: "3rem", display: "block", marginBottom: 12 }} />
                  <p style={{ fontWeight: 700 }}>No orders recorded yet</p>
                  <p style={{ fontSize: ".82rem" }}>Orders placed by students and staff will appear here</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Order ID</th><th>Items</th><th>Outlet</th><th>Type</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700 }}>#{String(o.id).slice(-5)}</td>
                        <td>{o.items.length} items</td>
                        <td>{o.outlet?.name || "—"}</td>
                        <td><Badge color={o.type === "pickup" ? "blue" : "gold"}>{o.type}</Badge></td>
                        <td style={{ fontWeight: 700 }}>₦{o.total.toLocaleString()}</td>
                        <td><span className={`admin-table-status ${(o.status || "Received") === "Completed" ? "active" : "pending"}`}>{o.status || "Received"}</span></td>
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
                <div className="admin-table-title">
                  <i className="bi bi-bicycle" /> Delivery Riders <span className="count">{DEMO_RIDERS.length}</span>
                </div>
              </div>
              <table className="admin-table">
                <thead><tr><th>Rider</th><th>Phone</th><th>Deliveries</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {DEMO_RIDERS.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>{r.name}</td>
                      <td style={{ fontFamily: "monospace" }}>{r.phone}</td>
                      <td>{r.deliveries}</td>
                      <td><i className="bi bi-star-fill" style={{ color: "var(--gold)", marginRight: 4, fontSize: ".72rem" }} />{r.rating}</td>
                      <td><span className={`admin-table-status ${r.status}`}>{r.status}</span></td>
                      <td><button className="admin-table-action"><i className="bi bi-three-dots" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="admin-table-card">
              <div className="admin-table-header">
                <div className="admin-table-title"><i className="bi bi-gear-fill" /> Platform Settings</div>
              </div>
              <div style={{ padding: 32 }}>
                <div style={{ display: "grid", gap: 18, maxWidth: 500 }}>
                  <div>
                    <label className="form-label">Platform Name</label>
                    <input className="form-input" defaultValue="FUOTUOKE Campus Eats" />
                  </div>
                  <div>
                    <label className="form-label">Admin Email</label>
                    <input className="form-input" defaultValue="admin@fuotuoke.edu.ng" />
                  </div>
                  <div>
                    <label className="form-label">Delivery Fee (₦)</label>
                    <input className="form-input" type="number" defaultValue="300" />
                  </div>
                  <div>
                    <label className="form-label">Max Order Limit</label>
                    <input className="form-input" type="number" defaultValue="10" />
                  </div>
                  <Btn variant="primary" sm>
                    <i className="bi bi-check-lg" /> Save Changes
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
