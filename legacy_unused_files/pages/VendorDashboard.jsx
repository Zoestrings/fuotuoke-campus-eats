import React, { useState } from "react";
import { OUTLETS, MENU } from "../data";
import { Btn, Badge } from "../components/ui";

export default function VendorDashboard({ orders, setOrders, accent, menuItems = [], setMenuItems }) {
  const [selectedOutlet, setSelected] = useState(OUTLETS[0].name);
  const [activeTab, setActiveTab]     = useState("active");
  const isGold = accent === "var(--gold)";

  // Add Item form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCat, setNewItemCat] = useState("Rice");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemImg, setNewItemImg] = useState("");
  const [newItemEmoji, setNewItemEmoji] = useState("");
  const [newItemPopular, setNewItemPopular] = useState(false);

  const canteenOrders   = orders.filter(o => o.outlet?.name === selectedOutlet);
  const activeOrders    = canteenOrders.filter(o => (o.status || "Received") !== "Completed");
  const completedOrders = canteenOrders.filter(o => o.status === "Completed");
  const totalRevenue    = canteenOrders.reduce((s, o) => s + o.total, 0);

  const itemCounts = {};
  canteenOrders.forEach(o => o.items.forEach(i => {
    const base = i.name.split(" (")[0];
    itemCounts[base] = (itemCounts[base] || 0) + i.qty;
  }));
  const topSelling = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const advance = (orderId, currentStatus, type) => {
    let next = "Completed";
    if (!currentStatus || currentStatus === "Received") next = "Preparing";
    else if (currentStatus === "Preparing") next = type === "pickup" ? "Ready for Pickup" : "Out for Delivery";
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next } : o));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("Image is too large! Please select an image smaller than 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImg(reader.result); // Base64 data string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm("Populate your menu list with the default campus meals?")) {
      setMenuItems(MENU);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) {
      alert("Please enter a name and price for the dish.");
      return;
    }

    const newItem = {
      id: Date.now(),
      name: newItemName.trim(),
      price: Number(newItemPrice),
      cat: newItemCat,
      desc: newItemDesc.trim() || "Freshly prepared campus special.",
      image: newItemImg.trim(),
      emoji: newItemEmoji || "",
      popular: newItemPopular,
      extras: [
        { name: "Extra Portion", price: Math.round(Number(newItemPrice) * 0.4) },
        { name: "Soft Drink", price: 400 }
      ]
    };

    setMenuItems(prev => [newItem, ...prev]);

    // Reset form fields
    setNewItemName("");
    setNewItemPrice("");
    setNewItemCat("Rice");
    setNewItemDesc("");
    setNewItemImg("");
    setNewItemEmoji("");
    setNewItemPopular(false);

    alert("✅ Menu item added successfully!");
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Are you sure you want to remove this dish from the menu?")) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const analyticsCards = [
    { label: "Canteen Revenue",  icon: "bi-cash-coin",      value: `₦${totalRevenue.toLocaleString()}`, sub: `${canteenOrders.length} orders total`,          valueColor: "var(--green-text)"                              },
    { label: "Active Orders",    icon: "bi-lightning-fill", value: `${activeOrders.length} active`,     sub: "Needs prep / dispatch",                         valueColor: isGold ? "var(--gold)" : "var(--primary)"        },
    { label: "Completed Today",  icon: "bi-check2-all",     value: `${completedOrders.length}`,         sub: "Successfully delivered",                        valueColor: "var(--text-dark)"                               },
  ];

  return (
    <div className="page-bg">
      <div className="page-content-vendor">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "var(--text-dark)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <i className="bi bi-fire" style={{ color: isGold ? "var(--gold)" : "var(--primary)" }} />
              Kitchen &amp; Canteen Panel
            </h2>
            <p style={{ color: "var(--text-light)", fontSize: ".88rem" }}>Manage incoming orders, update items list, and track analytics.</p>
          </div>
          <select
            value={selectedOutlet}
            onChange={e => setSelected(e.target.value)}
            className="form-input"
            style={{ width: "auto", cursor: "pointer", paddingRight: 20 }}
          >
            {OUTLETS.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
          </select>
        </div>

        {/* Analytics */}
        <div className="analytics-grid">
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

          {/* Top selling mini card */}
          <div className="analytics-card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 10 }}>
              <div className="analytics-card-label">Top Selling</div>
              <i className="bi bi-graph-up-arrow analytics-card-icon" />
            </div>
            {topSelling.length > 0
              ? topSelling.map(([name, count], i) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: ".8rem", color: "var(--text-dark)", fontWeight: 600, marginBottom: 4 }}>
                  <span>{i + 1}. {name}</span>
                  <span style={{ color: isGold ? "var(--gold)" : "var(--primary)" }}>{count}×</span>
                </div>
              ))
              : <div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>No sales yet</div>
            }
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-header">
          <button className={`tab-btn${activeTab === "active" ? ` active${isGold ? " staff" : ""}` : ""}`} onClick={() => setActiveTab("active")}>
            <i className="bi bi-clock-history" style={{ marginRight: 6 }} />
            Active Orders ({activeOrders.length})
          </button>
          <button className={`tab-btn${activeTab === "completed" ? ` active${isGold ? " staff" : ""}` : ""}`} onClick={() => setActiveTab("completed")}>
            <i className="bi bi-check2-circle" style={{ marginRight: 6 }} />
            Completed ({completedOrders.length})
          </button>
          <button className={`tab-btn${activeTab === "menu" ? ` active${isGold ? " staff" : ""}` : ""}`} onClick={() => setActiveTab("menu")}>
            <i className="bi bi-egg-fried" style={{ marginRight: 6 }} />
            Manage Menu ({menuItems.length})
          </button>
        </div>

        {/* Active orders */}
        {activeTab === "active" && (
          activeOrders.length === 0
            ? (
              <div style={{ textAlign: "center", padding: "52px 24px", background: "#fff", borderRadius: 14, border: "1px solid var(--border)" }}>
                <i className="bi bi-check-circle" style={{ fontSize: "3rem", color: "var(--green-text)", marginBottom: 12, display: "block" }} />
                <p style={{ fontWeight: 700, color: "var(--text-dark)", marginBottom: 4 }}>All clear!</p>
                <p style={{ color: "var(--text-light)", fontSize: ".86rem" }}>No active orders for {selectedOutlet}</p>
              </div>
            )
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {activeOrders.map(order => {
                  const status = order.status || "Received";
                  let btnIcon  = "bi-fire";
                  let btnLabel = "Start Preparing";
                  if (status === "Preparing") {
                    btnIcon  = order.type === "pickup" ? "bi-bag-check" : "bi-truck";
                    btnLabel = order.type === "pickup" ? "Ready for Pickup" : "Dispatch Delivery";
                  } else if (status === "Ready for Pickup" || status === "Out for Delivery") {
                    btnIcon  = "bi-check-circle-fill";
                    btnLabel = "Complete Order";
                  }

                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <div className="order-card-id">Order #{String(order.id).slice(-5)}</div>
                          <div className="order-card-meta">
                            <i className={`bi ${order.type === "pickup" ? "bi-bag-check" : "bi-truck"}`} style={{ marginRight: 4 }} />
                            {order.type === "pickup" ? "Pickup" : `Delivery to ${order.faculty}`}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Badge color={status === "Received" ? "blue" : "gold"}>{status}</Badge>
                          <Btn sm variant={isGold ? "gold" : "primary"} onClick={() => advance(order.id, status, order.type)}>
                            <i className={`bi ${btnIcon}`} /> {btnLabel}
                          </Btn>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {order.items.map(item => (
                          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", color: "var(--text-dark)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {item.image ? (
                                <img src={item.image} alt={item.name} style={{ width: 20, height: 20, borderRadius: 4, objectFit: "cover" }} />
                              ) : (
                                <span>{item.emoji}</span>
                              )}
                              <span><strong>{item.name}</strong> × {item.qty}</span>
                            </span>
                            <span style={{ color: "var(--text-light)" }}>₦{item.price.toLocaleString()} each</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", paddingTop: 10, marginTop: 10, fontWeight: 800, fontSize: ".9rem" }}>
                        <span style={{ color: "var(--text-dark)" }}>Order Value</span>
                        <span style={{ color: "var(--green-text)" }}>₦{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
        )}

        {/* Completed orders */}
        {activeTab === "completed" && (
          completedOrders.length === 0
            ? (
              <div style={{ textAlign: "center", padding: "52px 24px", background: "#fff", borderRadius: 14, border: "1px solid var(--border)" }}>
                <i className="bi bi-graph-up-arrow" style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: 12, display: "block" }} />
                <p style={{ fontWeight: 700, color: "var(--text-dark)", marginBottom: 4 }}>No completed orders yet</p>
                <p style={{ color: "var(--text-light)", fontSize: ".86rem" }}>Advance active orders to mark them complete</p>
              </div>
            )
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {completedOrders.map(order => (
                  <div key={order.id} className="order-card" style={{ opacity: 0.85 }}>
                    <div className="order-card-header">
                      <div>
                        <div className="order-card-id">Order #{String(order.id).slice(-5)}</div>
                        <div className="order-card-meta">Completed · {order.time}</div>
                      </div>
                      <Badge color="green">
                        <i className="bi bi-check-lg" style={{ marginRight: 4 }} /> Completed
                      </Badge>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", color: "var(--text-dark)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} style={{ width: 18, height: 18, borderRadius: 3, objectFit: "cover" }} />
                            ) : (
                              <span>{item.emoji}</span>
                            )}
                            <span>{item.name} × {item.qty}</span>
                          </span>
                          <span>₦{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
        )}

        {/* Manage Menu */}
        {activeTab === "menu" && (
          <div className="vendor-menu-layout">
            
            {/* Form */}
            <form onSubmit={handleAddItem} className="vendor-form-container">
              <h3 className="vendor-form-title">
                <i className="bi bi-plus-circle-fill" style={{ color: isGold ? "var(--gold)" : "var(--primary)" }} />
                Add Menu Dish
              </h3>
              
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Dish Name <span style={{ color: "var(--red)" }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Jollof Rice &amp; Grilled Turkey"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Price (₦) <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={newItemCat}
                    onChange={e => setNewItemCat(e.target.value)}
                    className="form-input"
                  >
                    <option value="Rice">Rice</option>
                    <option value="Soup">Soup</option>
                    <option value="Mains">Mains</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Fallback Emoji</label>
                  <input
                    type="text"
                    placeholder="e.g. 🍛"
                    value={newItemEmoji}
                    onChange={e => setNewItemEmoji(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
                  <input
                    type="checkbox"
                    id="popularCheck"
                    checked={newItemPopular}
                    onChange={e => setNewItemPopular(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <label htmlFor="popularCheck" className="form-label" style={{ margin: 0, cursor: "pointer" }}>Popular Item</label>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Upload Dish Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="form-input"
                  style={{ padding: "6px" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Or Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newItemImg}
                  onChange={e => setNewItemImg(e.target.value)}
                  className="form-input"
                />
              </div>

              {newItemImg && (
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">Selected Image Preview</label>
                  <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", height: 120 }}>
                    <img src={newItemImg} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setNewItemImg("")}
                      style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      title="Remove Image"
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Describe this dish briefly..."
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  className="form-input"
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>

              <Btn full variant={isGold ? "gold" : "primary"} type="submit">
                <i className="bi bi-plus-lg" /> Add to Canteen Menu
              </Btn>
            </form>

            {/* List */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-dark)" }}>
                  Current Campus Dishes ({menuItems.length})
                </h3>
                <p style={{ color: "var(--text-light)", fontSize: ".78rem" }}>Delete or inspect items currently listed on the student/staff menu.</p>
              </div>

              <div className="vendor-items-list">
                {menuItems.length === 0 ? (
                  <div className="empty-state" style={{ padding: "40px 20px", gridColumn: "1 / -1", textAlign: "center" }}>
                    <i className="bi bi-egg-fried empty-state-icon" style={{ fontSize: "2.5rem", color: "var(--text-light)", display: "block", marginBottom: 8 }} />
                    <p className="empty-state-text" style={{ margin: "0 0 16px" }}>Your campus menu is currently empty.</p>
                    <Btn sm variant={isGold ? "gold" : "primary"} onClick={handleLoadDemo}>
                      <i className="bi bi-cloud-arrow-down-fill" style={{ marginRight: 6 }} /> Load Default Campus Meals
                    </Btn>
                  </div>
                ) : (
                  menuItems.map(item => (
                    <div key={item.id} className={`vendor-item-card${isGold ? " staff" : ""}`}>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="vendor-item-delete-btn"
                        title="Remove Dish"
                      >
                        <i className="bi bi-trash3-fill" />
                      </button>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="item-img-card" style={{ height: 100 }} />
                      ) : (
                        <div className="item-emoji-card">{item.emoji}</div>
                      )}
                      <div style={{ fontWeight: 700, fontSize: ".85rem", color: "var(--text-dark)", marginBottom: 4, paddingRight: 24 }}>{item.name}</div>
                      <div style={{ fontSize: ".72rem", color: "var(--text-light)", marginBottom: 8 }}>{item.desc}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                        <span className="badge badge-blue" style={{ fontSize: ".65rem", padding: "3px 6px" }}>{item.cat}</span>
                        <span style={{ fontWeight: 800, fontSize: ".85rem", color: isGold ? "var(--gold)" : "var(--primary)" }}>
                          ₦{item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
