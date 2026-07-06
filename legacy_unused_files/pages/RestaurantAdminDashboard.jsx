import React, { useState } from "react";
import { OUTLETS, MENU } from "../data";
import { Btn, Badge } from "../components/ui";

export default function RestaurantAdminDashboard({ user, onLogout, menuItems = [], setMenuItems, orders = [], setOrders }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(OUTLETS[0].name);

  // Add item form
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCat, setNewCat] = useState("Rice");
  const [newDesc, setNewDesc] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [newImg, setNewImg] = useState("");

  const outletOrders = orders.filter(o => o.outlet?.name === selectedOutlet);
  const activeOrders = outletOrders.filter(o => (o.status || "Received") !== "Completed");
  const completedOrders = outletOrders.filter(o => o.status === "Completed");
  const totalRevenue = outletOrders.reduce((s, o) => s + o.total, 0);

  const advance = (orderId, currentStatus, type) => {
    let next = "Completed";
    if (!currentStatus || currentStatus === "Received") next = "Preparing";
    else if (currentStatus === "Preparing") next = type === "pickup" ? "Ready for Pickup" : "Out for Delivery";
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next } : o));
  };

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) { alert("Image too large! Max 1.5MB."); return; }
      const reader = new FileReader();
      reader.onloadend = () => setNewImg(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) { alert("Please enter a name and price."); return; }
    const item = {
      id: Date.now(), name: newName.trim(), price: Number(newPrice), cat: newCat,
      desc: newDesc.trim() || "Freshly prepared campus special.",
      image: newImg, emoji: newEmoji || "", popular: false,
      extras: [{ name: "Extra Portion", price: Math.round(Number(newPrice) * 0.4) }, { name: "Soft Drink", price: 400 }]
    };
    setMenuItems(prev => [item, ...prev]);
    setNewName(""); setNewPrice(""); setNewCat("Rice"); setNewDesc(""); setNewEmoji(""); setNewImg("");
    alert("✅ Menu item added!");
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Remove this dish from the menu?")) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const stats = [
    { label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, sub: `${outletOrders.length} orders`, icon: "bi-cash-coin", color: "gold" },
    { label: "Active Orders", value: activeOrders.length, sub: "Needs attention", icon: "bi-clock-history", color: "red" },
    { label: "Completed", value: completedOrders.length, sub: "Delivered today", icon: "bi-check2-all", color: "green" },
    { label: "Menu Items", value: menuItems.length, sub: "Listed dishes", icon: "bi-egg-fried", color: "gold" },
  ];

  const navItems = [
    { id: "overview", icon: "bi-grid-1x2-fill", label: "Overview" },
    { id: "orders", icon: "bi-receipt", label: "Orders" },
    { id: "menu", icon: "bi-egg-fried", label: "Menu" },
    { id: "analytics", icon: "bi-graph-up", label: "Analytics" },
  ];

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar-overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`admin-sidebar restaurant${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar-brand">
          <img src="/FUO_Logo.png" alt="Logo" />
          <div className="admin-sidebar-brand-text">
            <h3>Campus Eats</h3>
            <span className="rest">Restaurant Admin</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-section">Dashboard</div>
          {navItems.map(item => (
            <button key={item.id} className={`admin-nav-item${activeTab === item.id ? " active restaurant" : ""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
          <div className="admin-sidebar-section">Outlet</div>
          <div style={{ padding: "4px 14px" }}>
            <select value={selectedOutlet} onChange={e => setSelectedOutlet(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: ".82rem", cursor: "pointer" }}>
              {OUTLETS.map(o => <option key={o.id} value={o.name} style={{ color: "#000" }}>{o.name}</option>)}
            </select>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-user-avatar rest">{(user.name || "RA").slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="admin-user-name">{user.name || "Restaurant Admin"}</div>
              <div className="admin-user-role">{selectedOutlet}</div>
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
              <h1><i className="bi bi-shop" style={{ color: "var(--gold)" }} /> {selectedOutlet}</h1>
              <p>Restaurant Management Dashboard</p>
            </div>
          </div>
          <Badge color="gold"><i className="bi bi-fire" /> Restaurant Admin</Badge>
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

              <div className="admin-table-card">
                <div className="admin-table-header">
                  <div className="admin-table-title"><i className="bi bi-clock-history" /> Active Orders <span className="count">{activeOrders.length}</span></div>
                </div>
                {activeOrders.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                    <i className="bi bi-check-circle" style={{ fontSize: "2.5rem", display: "block", marginBottom: 8, color: "var(--green)" }} />
                    <p style={{ fontWeight: 700 }}>All clear! No active orders.</p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>Order</th><th>Items</th><th>Type</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {activeOrders.slice(0, 6).map(o => {
                        const status = o.status || "Received";
                        return (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 700 }}>#{String(o.id).slice(-5)}</td>
                            <td>{o.items.length} items</td>
                            <td><Badge color={o.type === "pickup" ? "blue" : "gold"}>{o.type}</Badge></td>
                            <td style={{ fontWeight: 700 }}>₦{o.total.toLocaleString()}</td>
                            <td><span className={`admin-table-status pending`}>{status}</span></td>
                            <td>
                              <Btn sm variant="gold" onClick={() => advance(o.id, status, o.type)}>
                                <i className="bi bi-arrow-right" /> Advance
                              </Btn>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="admin-grid-2">
              <div className="admin-table-card">
                <div className="admin-table-header">
                  <div className="admin-table-title"><i className="bi bi-lightning-fill" /> Active <span className="count">{activeOrders.length}</span></div>
                </div>
                {activeOrders.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No active orders</div>
                ) : (
                  <div style={{ maxHeight: 420, overflowY: "auto" }}>
                    {activeOrders.map(o => {
                      const status = o.status || "Received";
                      return (
                        <div key={o.id} style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontWeight: 800 }}>#{String(o.id).slice(-5)}</span>
                            <span className={`admin-table-status pending`}>{status}</span>
                          </div>
                          {o.items.map(item => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", marginBottom: 3 }}>
                              <span>{item.emoji} {item.name} × {item.qty}</span>
                              <span style={{ color: "var(--text-light)" }}>₦{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>
                            <span style={{ fontWeight: 800, color: "var(--green-text)" }}>₦{o.total.toLocaleString()}</span>
                            <Btn sm variant="gold" onClick={() => advance(o.id, status, o.type)}>Advance <i className="bi bi-arrow-right" /></Btn>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="admin-table-card">
                <div className="admin-table-header">
                  <div className="admin-table-title"><i className="bi bi-check2-all" /> Completed <span className="count">{completedOrders.length}</span></div>
                </div>
                {completedOrders.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No completed orders yet</div>
                ) : (
                  <div style={{ maxHeight: 420, overflowY: "auto" }}>
                    {completedOrders.map(o => (
                      <div key={o.id} style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)", opacity: .8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 700 }}>#{String(o.id).slice(-5)}</span>
                          <span className="admin-table-status active">Completed</span>
                        </div>
                        <div style={{ fontSize: ".78rem", color: "var(--text-light)", marginTop: 4 }}>{o.items.length} items · ₦{o.total.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === "menu" && (
            <div className="admin-grid-3">
              <div className="admin-table-card">
                <div className="admin-table-header">
                  <div className="admin-table-title"><i className="bi bi-egg-fried" /> Menu Items <span className="count">{menuItems.length}</span></div>
                  {menuItems.length === 0 && (
                    <Btn sm variant="gold" onClick={() => { if(window.confirm("Load default campus meals?")) setMenuItems(MENU); }}>
                      <i className="bi bi-cloud-arrow-down-fill" /> Load Defaults
                    </Btn>
                  )}
                </div>
                {menuItems.length === 0 ? (
                  <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                    <i className="bi bi-egg-fried" style={{ fontSize: "2.5rem", display: "block", marginBottom: 8 }} />
                    <p style={{ fontWeight: 700 }}>Menu is empty</p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Action</th></tr></thead>
                    <tbody>
                      {menuItems.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700 }}>{item.emoji} {item.name}</td>
                          <td><Badge color="blue">{item.cat}</Badge></td>
                          <td style={{ fontWeight: 700, color: "var(--gold)" }}>₦{item.price.toLocaleString()}</td>
                          <td>
                            <button className="admin-table-action" onClick={() => handleDeleteItem(item.id)} style={{ color: "var(--red)" }}>
                              <i className="bi bi-trash3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="admin-table-card" style={{ alignSelf: "start" }}>
                <div className="admin-table-header">
                  <div className="admin-table-title"><i className="bi bi-plus-circle-fill" /> Add Dish</div>
                </div>
                <form onSubmit={handleAddItem} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label className="form-label">Dish Name <span style={{ color: "var(--red)" }}>*</span></label>
                    <input className="form-input" placeholder="e.g. Jollof Rice" value={newName} onChange={e => setNewName(e.target.value)} required />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label className="form-label">Price (₦) *</label>
                      <input className="form-input" type="number" placeholder="2500" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
                    </div>
                    <div>
                      <label className="form-label">Category</label>
                      <select className="form-input" value={newCat} onChange={e => setNewCat(e.target.value)}>
                        <option>Rice</option><option>Soup</option><option>Mains</option><option>Snacks</option><option>Drinks</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Emoji</label>
                    <input className="form-input" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Image</label>
                    <input type="file" accept="image/*" onChange={handleImageFile} className="form-input" style={{ padding: 6 }} />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={2} style={{ resize: "none" }} placeholder="Brief description..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                  </div>
                  <Btn full variant="gold" type="submit">
                    <i className="bi bi-plus-lg" /> Add to Menu
                  </Btn>
                </form>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
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
                <div className="admin-table-card">
                  <div className="admin-table-header">
                    <div className="admin-table-title"><i className="bi bi-graph-up-arrow" /> Top Selling</div>
                  </div>
                  <div style={{ padding: 22 }}>
                    {(() => {
                      const counts = {};
                      outletOrders.forEach(o => o.items.forEach(i => { const n = i.name.split(" (")[0]; counts[n] = (counts[n]||0) + i.qty; }));
                      const top = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);
                      return top.length > 0 ? top.map(([name,count],i) => (
                        <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < top.length-1 ? "1px solid var(--border)" : "none" }}>
                          <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{i+1}. {name}</span>
                          <span style={{ fontWeight: 800, color: "var(--gold)" }}>{count}×</span>
                        </div>
                      )) : <div style={{ color: "var(--text-muted)", fontSize: ".84rem", padding: 20, textAlign: "center" }}>No sales data yet</div>;
                    })()}
                  </div>
                </div>
                <div className="admin-table-card">
                  <div className="admin-table-header">
                    <div className="admin-table-title"><i className="bi bi-pie-chart-fill" /> Order Breakdown</div>
                  </div>
                  <div style={{ padding: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 600 }}>Pickup Orders</span>
                      <span style={{ fontWeight: 800 }}>{outletOrders.filter(o => o.type === "pickup").length}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontWeight: 600 }}>Delivery Orders</span>
                      <span style={{ fontWeight: 800 }}>{outletOrders.filter(o => o.type === "delivery").length}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                      <span style={{ fontWeight: 600 }}>Average Order Value</span>
                      <span style={{ fontWeight: 800, color: "var(--green-text)" }}>₦{outletOrders.length > 0 ? Math.round(totalRevenue / outletOrders.length).toLocaleString() : 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
