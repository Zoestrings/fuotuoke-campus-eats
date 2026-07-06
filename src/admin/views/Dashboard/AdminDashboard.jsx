import React, { useState } from "react";
import { useAdminController } from "../../controllers/AdminController";
import UserManagement from "../UserManagement/UserManagement";
import VendorManagement from "../VendorManagement/VendorManagement";
import MenuManagement from "../MenuManagement/MenuManagement";
import OrderManagement from "../OrderManagement/OrderManagement";
import PaymentManagement from "../PaymentManagement/PaymentManagement";
import ReportsView from "../Reports/ReportsView";
import SettingsView from "../SystemSettings/SettingsView";
import AuditLogsView from "../AuditLogs/AuditLogsView";
import { Badge, Btn } from "../../../shared/ui";

export default function AdminDashboard({ onLogoutSuccess }) {
  const controller = useAdminController(onLogoutSuccess);
  const {
    user,
    activeTab,
    setActiveTab,
    users,
    menuItems,
    orders,
    payments,
    stats,
    settings,
    logs,
    logout,
    toggleUserStatus,
    deleteUser,
    saveUser,
    addUser,
    deleteMenuItem,
    deleteOrder,
    updateOrderStatus,
    updatePayment,
    deletePayment,
    saveSettings,
    resetPlatform
  } = controller;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "overview", icon: "bi-grid-1x2-fill", label: "Overview" },
    { id: "users", icon: "bi-people-fill", label: "User Management" },
    { id: "vendors", icon: "bi-shop", label: "Vendor Outlets" },
    { id: "menu", icon: "bi-egg-fried", label: "Global Menu" },
    { id: "orders", icon: "bi-receipt", label: "Orders Registry" },
    { id: "payments", icon: "bi-credit-card", label: "Transactions" },
    { id: "reports", icon: "bi-bar-chart-fill", label: "Reports" },
    { id: "settings", icon: "bi-gear-fill", label: "Settings" },
    { id: "logs", icon: "bi-journal-text", label: "Audit Logs" }
  ];

  const statCards = [
    { label: "Total Revenue", value: `₦${stats.totalRevenue?.toLocaleString() || 0}`, sub: `${stats.ordersCount || 0} orders`, icon: "bi-cash-coin", color: "purple" },
    { label: "Active Orders", value: stats.activeOrders || 0, sub: "In kitchens", icon: "bi-lightning-fill", color: "gold" },
    { label: "Platform Users", value: stats.userCount || 0, sub: "Registered", icon: "bi-people-fill", color: "blue" },
    { label: "Global Dishes", value: stats.menuCount || 0, sub: "Available", icon: "bi-egg-fried", color: "green" }
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "users":
        return <UserManagement users={users} onToggleStatus={toggleUserStatus} onDelete={deleteUser} onSave={saveUser} onAdd={addUser} />;
      case "vendors":
        return <VendorManagement users={users} />;
      case "menu":
        return <MenuManagement menuItems={menuItems} onDelete={deleteMenuItem} />;
      case "orders":
        return <OrderManagement orders={orders} onDelete={deleteOrder} onUpdateStatus={updateOrderStatus} />;
      case "payments":
        return <PaymentManagement payments={payments} onUpdate={updatePayment} onDelete={deletePayment} />;
      case "reports":
        return <ReportsView stats={stats} orders={orders} payments={payments} />;
      case "settings":
        return <SettingsView settings={settings} onSave={saveSettings} onReset={resetPlatform} />;
      case "logs":
        return <AuditLogsView logs={logs} />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    // Recent activity list derived from logs
    const recentActivity = logs.slice(0, 5).map(log => ({
      text: `${log.user} — ${log.action}`,
      time: log.time,
      color: log.user === "System" ? "gold" : "blue"
    }));

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
          {statCards.map(card => (
            <div key={card.label} style={{ background: "#fff", borderRadius: 14, padding: 22, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: ".76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{card.label}</div>
                <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text-dark)" }}>{card.value}</div>
                <div style={{ fontSize: ".72rem", color: "var(--text-light)", marginTop: 4 }}>{card.sub}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `var(--bg-main)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: `var(--text-dark)` }}>
                <i className={`bi ${card.icon}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Activity & System Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
          {/* Recent logs */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "var(--text-dark)", marginBottom: 16 }}>
              Recent Platform Operations
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recentActivity.map((act, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: act.color === "gold" ? "var(--gold)" : "var(--primary)", marginTop: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text-dark)" }}>{act.text}</div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>{act.time}</div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div style={{ fontSize: ".8rem", color: "var(--text-light)", textAlign: "center" }}>No logs recorded yet.</div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: 14 }}>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "var(--text-dark)", marginBottom: 2 }}>
              Quick Navigation
            </h4>
            <p style={{ fontSize: ".76rem", color: "var(--text-light)", marginBottom: 4 }}>Jump directly into management screens.</p>
            <Btn full variant="outline" onClick={() => setActiveTab("users")} style={{ justifyContent: "flex-start", gap: 10, padding: "10px 14px", fontSize: ".82rem" }}>
              <i className="bi bi-people-fill" /> User Access Controls
            </Btn>
            <Btn full variant="outline" onClick={() => setActiveTab("menu")} style={{ justifyContent: "flex-start", gap: 10, padding: "10px 14px", fontSize: ".82rem" }}>
              <i className="bi bi-egg-fried" /> Global Platform Menu
            </Btn>
            <Btn full variant="outline" onClick={() => setActiveTab("orders")} style={{ justifyContent: "flex-start", gap: 10, padding: "10px 14px", fontSize: ".82rem" }}>
              <i className="bi bi-receipt" /> Platform Orders Log
            </Btn>
            <Btn full variant="outline" onClick={() => setActiveTab("settings")} style={{ justifyContent: "flex-start", gap: 10, padding: "10px 14px", fontSize: ".82rem", color: "var(--red)" }}>
              <i className="bi bi-gear-fill" /> Settings &amp; Maintenance
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      <div className={`admin-sidebar-overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar superadmin${sidebarOpen ? " open" : ""}`} style={{ background: "var(--bg-dark)" }}>
        <div className="admin-sidebar-brand" style={{ cursor: "pointer" }} onClick={() => setActiveTab("overview")}>
          <img src="/FUO_Logo.png" alt="Logo" />
          <div className="admin-sidebar-brand-text">
            <h3 style={{ color: "#fff" }}>Campus Eats</h3>
            <span className="super" style={{ color: "var(--gold)" }}>Platform Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-section" style={{ color: "rgba(255,255,255,0.4)" }}>Operations</div>
          {navItems.map(item => (
            <button key={item.id} className={`admin-nav-item${activeTab === item.id ? " active" : ""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
          <div className="admin-sidebar-section" style={{ color: "rgba(255,255,255,0.4)" }}>Identity</div>
          <div style={{ padding: "10px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ color: "#fff", fontSize: ".76rem" }}>
              <i className="bi bi-person-badge" style={{ marginRight: 6 }} />
              {user.name}
            </div>
            <Btn full variant="danger" sm onClick={logout}>
              <i className="bi bi-box-arrow-right" /> Log Out
            </Btn>
          </div>
        </nav>
      </aside>

      {/* Main Page Area */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <button className="admin-menu-toggle" onClick={() => setSidebarOpen(true)}>
            <i className="bi bi-list" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: ".84rem", fontWeight: 700, color: "var(--text-dark)" }}>Platform Control Center</span>
            <Badge color="green">Secure SSL</Badge>
          </div>
        </header>

        {/* Content Box */}
        <div className="admin-content">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
}
