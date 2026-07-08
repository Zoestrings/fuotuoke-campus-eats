import React, { useState } from "react";
import { useVendorController } from "../../controllers/VendorController";
import MealsManagement from "../Meals/MealsManagement";
import CategoriesManagement from "../Categories/CategoriesManagement";
import OrdersManagement from "../Orders/OrdersManagement";
import PricingManagement from "../Pricing/PricingManagement";
import ReportsView from "../Reports/ReportsView";
import ProfileView from "../Profile/ProfileView";
import { OUTLETS } from "../../../data";
import { Badge, Btn } from "../../../shared/ui";

export default function VendorDashboard({ onLogoutSuccess }) {
  const controller = useVendorController(onLogoutSuccess);
  const {
    user,
    selectedOutlet,
    setSelectedOutlet,
    activeTab,
    setActiveTab,
    orders,
    menuItems,
    stats,
    newItemName,    setNewItemName,
    newItemPrice,   setNewItemPrice,
    newItemCat,     setNewItemCat,
    newItemDesc,    setNewItemDesc,
    newItemImg,     setNewItemImg,
    newItemEmoji,   setNewItemEmoji,
    newItemPopular, setNewItemPopular,
    logout,
    advanceOrderStatus,
    handleAddItem,
    handleDeleteItem,
    loadDemoMeals
  } = controller;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeOrders    = orders.filter(o => o.status !== "Completed");
  const completedOrders = orders.filter(o => o.status === "Completed");

  const analyticsCards = [
    { label: "Canteen Revenue",   icon: "bi-cash-coin",    value: `₦${stats.totalRevenue.toLocaleString()}`, sub: `${orders.length} orders total`,     valueColor: "var(--green-text)" },
    { label: "Active Orders",     icon: "bi-lightning-fill",value: `${stats.activeCount} active`,             sub: "Needs prep / dispatch",              valueColor: "var(--gold)" },
    { label: "Completed Orders",  icon: "bi-check2-all",   value: `${stats.completedCount}`,                 sub: "Successfully delivered",             valueColor: "var(--text-dark)" }
  ];

  const tabList = [
    { id: "active",     icon: "bi-clock-history",  label: `Active (${activeOrders.length})`    },
    { id: "completed",  icon: "bi-check2-circle",  label: `Done (${completedOrders.length})`   },
    { id: "menu",       icon: "bi-egg-fried",      label: `Menu (${menuItems.length})`          },
    { id: "categories", icon: "bi-tags",           label: "Categories"                          },
    { id: "pricing",    icon: "bi-tags-fill",      label: "Pricing"                             },
    { id: "reports",    icon: "bi-bar-chart",      label: "Reports"                             },
    { id: "profile",    icon: "bi-shop",           label: "Profile"                             }
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)", paddingBottom: 60 }}>

      {/* ── Top Navigation Bar ─────────────────────────── */}
      <nav className="navbar staff">
        {/* Brand */}
        <div className="nav-brand">
          <img src="/FUO_Logo.png" alt="Logo" className="nav-brand-img" style={{ width: 34, height: 34, objectFit: "contain" }} />
          <div>
            <div className="nav-brand-title">FUOTUOKE Campus Eats</div>
            <div className="nav-brand-subtitle">Kitchen &amp; Canteen Hub</div>
          </div>
        </div>

        {/* Desktop right side (hidden on mobile) */}
        <div className="nav-links">
          <div className="nav-user-info">
            <i className="bi bi-fire" style={{ fontSize: "1rem", color: "var(--gold)", opacity: 0.9 }} />
            <span className="nav-user-name">{user.name || "Kitchen Staff"}</span>
            <span className="nav-user-role-badge" style={{ color: "var(--gold)" }}>Kitchen Hub</span>
          </div>

          {/* Logout dropdown */}
          <div style={{ position: "relative" }}>
            <button className="nav-btn" onClick={() => setShowLogoutConfirm(!showLogoutConfirm)} style={{ gap: 6 }}>
              <i className="bi bi-box-arrow-right" style={{ fontSize: "1rem" }} /> Logout
            </button>
            {showLogoutConfirm && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,.22)", zIndex: 1000, minWidth: 230, overflow: "hidden", border: "1px solid var(--border)" }}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                  <p style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--text-dark)", margin: 0 }}>Sign out?</p>
                  <p style={{ fontSize: ".78rem", color: "var(--text-light)", margin: "4px 0 0" }}>Sign out of the kitchen control panel.</p>
                </div>
                <div style={{ display: "flex", gap: 8, padding: "12px 14px" }}>
                  <button onClick={() => setShowLogoutConfirm(false)} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={() => { setShowLogoutConfirm(false); logout(); }} className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                    <i className="bi bi-box-arrow-right" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          id="vendor-nav-hamburger"
          className="nav-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
        >
          <i className="bi bi-list" />
        </button>
      </nav>

      {/* ── Mobile Nav Drawer ──────────────────────────── */}
      <div
        className={`nav-drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="vendor-nav-drawer"
        className={`nav-drawer staff${drawerOpen ? " open" : ""}`}
        aria-label="Vendor navigation menu"
      >
        {/* Header */}
        <div className="nav-drawer-header">
          <div className="nav-drawer-brand">
            <img src="/FUO_Logo.png" alt="Logo" />
            <span className="nav-drawer-brand-title">Kitchen Hub</span>
          </div>
          <button className="nav-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* User info */}
        <div className="nav-drawer-user">
          <div className="nav-drawer-user-avatar" style={{ color: "var(--gold)" }}>
            <i className="bi bi-fire" />
          </div>
          <div>
            <div className="nav-drawer-user-name">{user.name || "Kitchen Staff"}</div>
            <div className="nav-drawer-user-role">Kitchen &amp; Canteen</div>
          </div>
        </div>

        {/* Tab navigation inside drawer */}
        <div className="nav-drawer-links">
          {tabList.map(tab => (
            <button
              key={tab.id}
              id={`vendor-drawer-${tab.id}`}
              className={`nav-drawer-item${activeTab === tab.id ? " active staff" : ""}`}
              onClick={() => { setActiveTab(tab.id); setDrawerOpen(false); }}
            >
              <i className={`bi ${tab.icon}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="nav-drawer-footer">
          <button id="vendor-drawer-logout" className="nav-drawer-logout" onClick={() => { setDrawerOpen(false); logout(); }}>
            <i className="bi bi-box-arrow-right" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────── */}
      <div className="page-bg" style={{ paddingTop: 24 }}>
        <div className="page-content-vendor animate-fade-in">

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "var(--text-dark)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
                <i className="bi bi-fire" style={{ color: "var(--gold)" }} />
                Kitchen &amp; Canteen Management
              </h2>
              <p style={{ color: "var(--text-light)", fontSize: ".88rem" }}>Manage incoming orders, update items list, and track analytics.</p>
            </div>
            <select
              value={selectedOutlet}
              onChange={e => setSelectedOutlet(e.target.value)}
              className="form-input"
              style={{ width: "auto", cursor: "pointer", paddingRight: 20 }}
            >
              {OUTLETS.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
            </select>
          </div>

          {/* Analytics Cards */}
          <div className="analytics-grid" style={{ marginBottom: 28 }}>
            {analyticsCards.map(({ label, icon, value, sub, valueColor }) => (
              <div key={label} className="analytics-card">
                <div className="analytics-card-left">
                  <div className="analytics-card-label">{label}</div>
                  <div className="analytics-card-value" style={{ color: valueColor }}>{value}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--text-light)", marginTop: 4 }}>{sub}</div>
                </div>
                <i className={`bi ${icon} analytics-card-icon`} />
              </div>
            ))}

            {/* Top Selling */}
            <div className="analytics-card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 10 }}>
                <div className="analytics-card-label">Top Selling</div>
                <i className="bi bi-graph-up-arrow analytics-card-icon" />
              </div>
              {stats.topSelling.length > 0
                ? stats.topSelling.map(([name, count], i) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: ".8rem", color: "var(--text-dark)", fontWeight: 600, marginBottom: 4 }}>
                    <span>{i + 1}. {name}</span>
                    <span style={{ color: "var(--gold)" }}>{count}×</span>
                  </div>
                ))
                : <div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>No sales yet</div>
              }
            </div>
          </div>

          {/* Tab navigation — horizontally scrollable on mobile */}
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 24 }}>
            <div className="tabs-header" style={{ flexWrap: "nowrap", minWidth: "max-content", marginBottom: 0 }}>
              {tabList.map(tab => (
                <button
                  key={tab.id}
                  id={`vendor-tab-${tab.id}`}
                  className={`tab-btn${activeTab === tab.id ? " active staff" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`bi ${tab.icon}`} style={{ marginRight: 6 }} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === "active" && (
            <OrdersManagement orders={activeOrders} outletName={selectedOutlet} onAdvanceStatus={advanceOrderStatus} />
          )}
          {activeTab === "completed" && (
            <OrdersManagement orders={completedOrders} outletName={selectedOutlet} isCompletedView />
          )}
          {activeTab === "menu" && (
            <MealsManagement
              menuItems={menuItems}
              onDelete={handleDeleteItem}
              onLoadDemo={loadDemoMeals}
              onSubmitForm={handleAddItem}
              formStates={{ newItemName, setNewItemName, newItemPrice, setNewItemPrice, newItemCat, setNewItemCat, newItemDesc, setNewItemDesc, newItemImg, setNewItemImg, newItemEmoji, setNewItemEmoji, newItemPopular, setNewItemPopular }}
            />
          )}
          {activeTab === "categories" && <CategoriesManagement menuItems={menuItems} />}
          {activeTab === "pricing"    && <PricingManagement menuItems={menuItems} selectedOutlet={selectedOutlet} />}
          {activeTab === "reports"    && <ReportsView orders={orders} stats={stats} />}
          {activeTab === "profile"    && <ProfileView selectedOutlet={selectedOutlet} />}

        </div>
      </div>
    </div>
  );
}
