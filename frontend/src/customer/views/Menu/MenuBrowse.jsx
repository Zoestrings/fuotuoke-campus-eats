import React, { useState, useMemo, memo } from "react";
import { OUTLETS } from "../../../data";
import { Btn } from "../../../shared/ui";

const CATS = ["All", "Rice", "Soup", "Mains", "Snacks", "Drinks"];

function MenuBrowse({ isStaff, accent, outlet, setOutlet, orderType, setOType, cart, addItem, removeItem, cartCount, cartTotal, setPage, onCustomizeItem, menuItems = [] }) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const getQty = id => {
    const found = cart.find(x => x.baseId === id || x.id === id);
    return found ? found.qty : 0;
  };

  // Memoized: only recalculates when menuItems, cat, or search changes
  const filtered = useMemo(
    () => menuItems.filter(m =>
      (cat === "All" || m.cat === cat) &&
      m.name.toLowerCase().includes(search.toLowerCase())
    ),
    [menuItems, cat, search]
  );

  return (
    <div className="page-bg animate-fade-in">
      <div className="page-content-menu">

        {/* Title */}
        <div className="page-section-header">
          <h2 className="page-heading">
            <i className="bi bi-grid" style={{ color: accent }} />
            Campus Menu
          </h2>
          <p className="page-subheading">
            {outlet
              ? `Ordering from: ${OUTLETS.find(o => o.id === outlet)?.name}`
              : "Select a canteen below, then choose your meals"}
          </p>
        </div>

        {/* Outlet filters */}
        <div className="filters-row">
          {OUTLETS.map(o => (
            <button
              key={o.id}
              className={`filter-btn${outlet === o.id ? (isStaff ? " active-gold" : " active-primary") : ""}`}
              onClick={() => setOutlet(o.id)}
            >
              <i className={`bi ${o.biIcon || "bi-shop"}`} style={{ marginRight: 6 }} />
              {o.name}
            </button>
          ))}
        </div>

        {/* Order type toggle */}
        <div className="order-type-toggle">
          {[
            ["pickup", "bi-bag-check", "Pickup"],
            ["delivery", "bi-truck", "Faculty Delivery"],
          ].map(([val, icon, label]) => (
            <button
              key={val}
              onClick={() => setOType(val)}
              className={`order-type-btn${orderType === val ? (isStaff ? " active-gold" : " active-primary") : ""}`}
            >
              <i className={`bi ${icon}`} /> {label}
            </button>
          ))}
        </div>

        {/* Search & categories */}
        <div className="search-cat-bar">
          <div className="search-input-wrapper">
            <i className="bi bi-search search-input-icon" />
            <input
              className={`search-input${isStaff ? " staff" : ""}`}
              placeholder="Search meals…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="cat-filter-group">
            {CATS.map(c => (
              <button
                key={c}
                className={`filter-btn${cat === c ? (isStaff ? " active-gold" : " active-primary") : ""}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        {menuItems.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-egg-fried empty-state-icon" />
            <p className="empty-state-text">Menu is empty</p>
            <p style={{ fontSize: ".82rem", color: "var(--text-light)", marginBottom: 0 }}>
              No meals have been added yet. Please ask the Admin to add items.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-search empty-state-icon" />
            <p className="empty-state-text">No dishes match your search.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map(item => {
              const qty = getQty(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onCustomizeItem(item)}
                  className={`menu-card${isStaff ? " staff" : ""}`}
                >
                  <div className="menu-card-top">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="item-img-card" loading="lazy" />
                    ) : (
                      <span className="item-emoji-card">{item.emoji}</span>
                    )}
                    {item.popular && (
                      <span className={`badge ${isStaff ? "badge-gold" : "badge-blue"}`} style={{ height: "fit-content" }}>
                        <i className="bi bi-star-fill" style={{ fontSize: ".65rem" }} /> Popular
                      </span>
                    )}
                  </div>
                  <div className="menu-card-name">{item.name}</div>
                  <div className="menu-card-desc">{item.desc}</div>
                  <div className="menu-card-footer" onClick={e => e.stopPropagation()}>
                    <span className="menu-card-price" style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>
                      ₦{item.price.toLocaleString()}
                    </span>
                    {qty === 0 ? (
                      <Btn sm variant={isStaff ? "gold" : "primary"} onClick={e => { e.stopPropagation(); onCustomizeItem(item); }}>
                        <i className="bi bi-plus-lg" /> Add
                      </Btn>
                    ) : (
                      <div className="qty-adjuster">
                        <button
                          className="qty-btn"
                          style={{ width: 26, height: 26, border: `1.5px solid ${isStaff ? "var(--gold)" : "var(--primary)"}`, color: isStaff ? "var(--gold)" : "var(--primary)" }}
                          onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                        >
                          <i className="bi bi-dash" style={{ fontSize: ".85rem" }} />
                        </button>
                        <span className="qty-display">{qty}</span>
                        <button
                          className={`qty-btn-filled${isStaff ? " staff" : ""}`}
                          style={{ width: 26, height: 26 }}
                          onClick={e => { e.stopPropagation(); addItem(item); }}
                        >
                          <i className="bi bi-plus" style={{ fontSize: ".85rem" }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating cart button */}
        {cartCount > 0 && (
          <div className="floating-cart-wrap">
            <button
              onClick={() => setPage("cart")}
              className={`floating-cart-btn${isStaff ? " staff" : ""}`}
            >
              <i className="bi bi-cart3" style={{ fontSize: "1.1rem" }} />
              View Cart · <strong>{cartCount}</strong> · ₦{cartTotal.toLocaleString()}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Wrap in memo: skips re-render when parent updates but props haven't changed
export default memo(MenuBrowse);
