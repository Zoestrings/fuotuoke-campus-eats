import React, { useState, useMemo, memo, useCallback } from "react";
import { OUTLETS } from "../../../data";
import { Btn } from "../../../shared/ui";

const CATS = ["All", "Rice", "Soup", "Mains", "Snacks", "Drinks"];

const CAT_ICONS = {
  All: "bi-grid-3x3-gap-fill",
  Rice: "bi-egg-fried",
  Soup: "bi-cup-hot-fill",
  Mains: "bi-fire",
  Snacks: "bi-box-seam-fill",
  Drinks: "bi-cup-straw",
};

/* ── Placeholder for broken / missing images ─────────── */
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23222'%3E%3Crect width='400' height='300' rx='0' fill='%231a1a1f'/%3E%3Ctext x='50%25' y='48%25' text-anchor='middle' fill='%23555' font-size='48' font-family='sans-serif'%3E🍽️%3C/text%3E%3Ctext x='50%25' y='66%25' text-anchor='middle' fill='%23444' font-size='13' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

/* ── Generate a stable "rating" from item id ─────────── */
const getRating = (id) => {
  const ratings = [4.2, 4.5, 4.8, 4.0, 4.3, 4.7, 4.1, 4.6, 4.9, 4.4];
  return ratings[id % ratings.length];
};

const getReviewCount = (id) => {
  const counts = [24, 57, 89, 12, 45, 72, 33, 66, 91, 18];
  return counts[id % counts.length];
};

/* ── Star Rating Component ───────────────────────────── */
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  return (
    <span className="mn-stars">
      {[...Array(5)].map((_, i) => (
        <i
          key={i}
          className={`bi ${i < fullStars ? "bi-star-fill" : i === fullStars && hasHalf ? "bi-star-half" : "bi-star"}`}
        />
      ))}
      <span className="mn-rating-num">{rating.toFixed(1)}</span>
    </span>
  );
};

/* ── Menu Card Component ─────────────────────────────── */
const MenuCard = memo(({ item, isStaff, qty, onCustomize, onAdd, onRemove }) => {
  const rating = getRating(item.id);
  const reviews = getReviewCount(item.id);
  const isAvailable = true; // All items available by default

  const handleImgError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_IMG;
  }, []);

  return (
    <div
      onClick={() => onCustomize(item)}
      className={`mn-card${isStaff ? " staff" : ""}`}
    >
      {/* Image area */}
      <div className="mn-card-img-wrap">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="mn-card-img"
            loading="lazy"
            onError={handleImgError}
          />
        ) : item.emoji ? (
          <div className="mn-card-img-placeholder">
            <span className="mn-card-emoji">{item.emoji}</span>
          </div>
        ) : (
          <img
            src={PLACEHOLDER_IMG}
            alt={item.name}
            className="mn-card-img"
          />
        )}

        {/* Category badge */}
        <span className="mn-card-cat-badge">
          <i className={`bi ${CAT_ICONS[item.cat] || "bi-tag"}`} /> {item.cat}
        </span>

        {/* Popular badge */}
        {item.popular && (
          <span className={`mn-card-popular-badge${isStaff ? " staff" : ""}`}>
            <i className="bi bi-fire" /> Popular
          </span>
        )}

        {/* Availability */}
        {isAvailable && (
          <span className="mn-card-avail-badge">
            <span className="mn-avail-dot" /> Available
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mn-card-body">
        <h4 className="mn-card-title">{item.name}</h4>
        <p className="mn-card-desc">{item.desc}</p>

        {/* Rating */}
        <div className="mn-card-rating-row">
          <StarRating rating={rating} />
          <span className="mn-review-count">({reviews})</span>
        </div>

        {/* Extras hint */}
        {item.extras && item.extras.length > 0 && (
          <div className="mn-card-extras-hint">
            <i className="bi bi-plus-circle" />
            {item.extras.length} add-on{item.extras.length > 1 ? "s" : ""} available
          </div>
        )}

        {/* Price + Cart Controls */}
        <div className="mn-card-footer" onClick={(e) => e.stopPropagation()}>
          <span className={`mn-card-price${isStaff ? " staff" : ""}`}>
            ₦{item.price.toLocaleString()}
          </span>

          {qty === 0 ? (
            <button
              className={`mn-add-btn${isStaff ? " staff" : ""}`}
              onClick={(e) => { e.stopPropagation(); onCustomize(item); }}
            >
              <i className="bi bi-cart-plus" /> Add
            </button>
          ) : (
            <div className="mn-qty-controls">
              <button
                className={`mn-qty-btn${isStaff ? " staff" : ""}`}
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              >
                <i className="bi bi-dash" />
              </button>
              <span className="mn-qty-num">{qty}</span>
              <button
                className={`mn-qty-btn mn-qty-btn-fill${isStaff ? " staff" : ""}`}
                onClick={(e) => { e.stopPropagation(); onAdd(item); }}
              >
                <i className="bi bi-plus" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════
   Main MenuBrowse Component
   ════════════════════════════════════════════════════════ */
function MenuBrowse({
  isStaff, accent, outlet, setOutlet,
  orderType, setOType, cart, addItem, removeItem,
  cartCount, cartTotal, setPage, onCustomizeItem, menuItems = []
}) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const getQty = (id) => {
    const found = cart.find((x) => x.baseId === id || x.id === id);
    return found ? found.qty : 0;
  };

  /* ── Derived data ───────────────────────────────────── */
  const popularItems = useMemo(
    () => menuItems.filter((m) => m.popular),
    [menuItems]
  );

  const filtered = useMemo(
    () =>
      menuItems.filter(
        (m) =>
          (cat === "All" || m.cat === cat) &&
          (m.name.toLowerCase().includes(search.toLowerCase()) ||
            (m.desc && m.desc.toLowerCase().includes(search.toLowerCase())))
      ),
    [menuItems, cat, search]
  );

  const categoryCounts = useMemo(() => {
    const counts = { All: menuItems.length };
    CATS.forEach((c) => {
      if (c !== "All") counts[c] = menuItems.filter((m) => m.cat === c).length;
    });
    return counts;
  }, [menuItems]);

  return (
    <div className="mn-page animate-fade-in">
      <div className="mn-container">

        {/* ── Header ──────────────────────────────────── */}
        <div className="mn-header">
          <div className="mn-header-top">
            <div>
              <h2 className="mn-main-title">
                <i className="bi bi-grid-3x3-gap-fill" style={{ color: accent }} />
                Campus Menu
              </h2>
              <p className="mn-subtitle">
                {outlet
                  ? <>Ordering from: <strong>{OUTLETS.find((o) => o.id === outlet)?.name}</strong></>
                  : "Select a canteen below, then choose your meals"}
              </p>
            </div>
            <div className="mn-header-stats">
              <span className="mn-stat-chip">
                <i className="bi bi-shop" /> {OUTLETS.length} Outlets
              </span>
              <span className="mn-stat-chip">
                <i className="bi bi-egg-fried" /> {menuItems.length} Items
              </span>
            </div>
          </div>
        </div>

        {/* ── Outlet Selector ─────────────────────────── */}
        <div className="mn-outlet-bar">
          {OUTLETS.map((o) => (
            <button
              key={o.id}
              className={`mn-outlet-chip${outlet === o.id ? (isStaff ? " active-gold" : " active") : ""}`}
              onClick={() => setOutlet(o.id)}
            >
              <i className={`bi ${o.biIcon || "bi-shop"}`} />
              <span>{o.name}</span>
            </button>
          ))}
        </div>

        {/* ── Order Type Toggle ────────────────────────── */}
        <div className="mn-order-toggle">
          {[
            ["pickup", "bi-bag-check-fill", "Pickup"],
            ["delivery", "bi-truck", "Faculty Delivery"],
          ].map(([val, icon, label]) => (
            <button
              key={val}
              onClick={() => setOType(val)}
              className={`mn-order-btn${orderType === val ? (isStaff ? " active-gold" : " active") : ""}`}
            >
              <i className={`bi ${icon}`} /> {label}
            </button>
          ))}
        </div>

        {/* ── Search Bar ──────────────────────────────── */}
        <div className="mn-search-wrap">
          <i className="bi bi-search mn-search-icon" />
          <input
            className={`mn-search-input${isStaff ? " staff" : ""}`}
            placeholder="Search meals, snacks, drinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="mn-search-clear" onClick={() => setSearch("")}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        {/* ── Category Tabs ───────────────────────────── */}
        <div className="mn-cat-tabs">
          {CATS.map((c) => (
            <button
              key={c}
              className={`mn-cat-btn${cat === c ? (isStaff ? " active-gold" : " active") : ""}`}
              onClick={() => setCat(c)}
            >
              <i className={`bi ${CAT_ICONS[c]}`} />
              <span>{c}</span>
              <span className="mn-cat-count">{categoryCounts[c] || 0}</span>
            </button>
          ))}
        </div>

        {/* ── Popular Today Section ────────────────────── */}
        {cat === "All" && !search && popularItems.length > 0 && (
          <section className="mn-popular-section">
            <div className="mn-section-head">
              <h3 className="mn-section-title">
                <i className="bi bi-fire" style={{ color: "#f97316" }} /> Popular Today
              </h3>
              <span className="mn-section-badge">{popularItems.length} trending</span>
            </div>
            <div className="mn-popular-scroll">
              {popularItems.slice(0, 8).map((item) => {
                const qty = getQty(item.id);
                return (
                  <div
                    key={`pop-${item.id}`}
                    className={`mn-pop-card${isStaff ? " staff" : ""}`}
                    onClick={() => onCustomizeItem(item)}
                  >
                    <div className="mn-pop-img-wrap">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="mn-pop-img" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }} />
                      ) : (
                        <div className="mn-pop-img-placeholder">
                          <span>{item.emoji || "🍲"}</span>
                        </div>
                      )}
                      <span className={`mn-pop-rank${isStaff ? " staff" : ""}`}>
                        <i className="bi bi-fire" />
                      </span>
                    </div>
                    <div className="mn-pop-info">
                      <h4 className="mn-pop-name">{item.name}</h4>
                      <StarRating rating={getRating(item.id)} />
                      <div className="mn-pop-footer" onClick={(e) => e.stopPropagation()}>
                        <span className={`mn-pop-price${isStaff ? " staff" : ""}`}>₦{item.price.toLocaleString()}</span>
                        {qty === 0 ? (
                          <button className={`mn-pop-add${isStaff ? " staff" : ""}`} onClick={(e) => { e.stopPropagation(); onCustomizeItem(item); }}>
                            <i className="bi bi-plus" />
                          </button>
                        ) : (
                          <span className="mn-pop-qty-badge">{qty}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Main Grid ───────────────────────────────── */}
        <section className="mn-grid-section">
          <div className="mn-section-head">
            <h3 className="mn-section-title">
              <i className={`bi ${CAT_ICONS[cat]}`} style={{ color: accent }} />
              {cat === "All" ? "All Menu Items" : cat}
            </h3>
            <span className="mn-section-badge">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {menuItems.length === 0 ? (
            <div className="mn-empty">
              <div className="mn-empty-icon"><i className="bi bi-egg-fried" /></div>
              <h4>Menu is empty</h4>
              <p>No meals have been added yet. Please ask the Admin to add items.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mn-empty">
              <div className="mn-empty-icon"><i className="bi bi-search" /></div>
              <h4>No dishes found</h4>
              <p>Try adjusting your search or selecting a different category.</p>
              <button className="mn-empty-reset" onClick={() => { setCat("All"); setSearch(""); }}>
                <i className="bi bi-arrow-counterclockwise" /> Reset Filters
              </button>
            </div>
          ) : (
            <div className="mn-grid">
              {filtered.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  isStaff={isStaff}
                  qty={getQty(item.id)}
                  onCustomize={onCustomizeItem}
                  onAdd={addItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Floating Cart Button ─────────────────────── */}
        {cartCount > 0 && (
          <div className="mn-floating-cart-wrap">
            <button
              onClick={() => setPage("cart")}
              className={`mn-floating-cart${isStaff ? " staff" : ""}`}
            >
              <div className="mn-cart-icon-wrap">
                <i className="bi bi-cart3" />
                <span className="mn-cart-badge">{cartCount}</span>
              </div>
              <span className="mn-cart-label">View Cart</span>
              <span className="mn-cart-total">₦{cartTotal.toLocaleString()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MenuBrowse);
