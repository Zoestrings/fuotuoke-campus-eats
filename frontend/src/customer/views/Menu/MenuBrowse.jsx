import React, { useState, useMemo, memo, useCallback } from "react";
import { OUTLETS } from "../../../data";

const CATS = ["All", "Rice", "Soup", "Mains", "Snacks", "Drinks"];

const CAT_ICONS = {
  All: "bi-grid-3x3-gap-fill",
  Rice: "bi-egg-fried",
  Soup: "bi-cup-hot-fill",
  Mains: "bi-fire",
  Snacks: "bi-box-seam-fill",
  Drinks: "bi-cup-straw",
};

const CAT_EMOJIS = {
  All: "🍽️",
  Rice: "🍚",
  Soup: "🍲",
  Mains: "🥘",
  Snacks: "🥨",
  Drinks: "🥤",
};

/* ── Placeholder for missing / broken images ─────────── */
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23222'%3E%3Crect width='400' height='300' fill='%231a1a1f'/%3E%3Ctext x='50%25' y='46%25' text-anchor='middle' fill='%23555' font-size='44' font-family='sans-serif'%3E🍲%3C/text%3E%3Ctext x='50%25' y='68%25' text-anchor='middle' fill='%23444' font-size='13' font-family='sans-serif'%3EFUOTUOKE Campus Eats%3C/text%3E%3C/svg%3E";

/* ── Generate stable "rating" and prep time ───────────── */
const getRating = (id) => {
  const ratings = [4.8, 4.5, 4.9, 4.6, 4.7, 4.4, 4.8, 4.7, 4.9, 4.5];
  return ratings[id % ratings.length];
};

const getPrepTime = (id) => {
  const times = ["15–20 min", "20–30 min", "10–15 min", "20–25 min", "15–25 min"];
  return times[id % times.length];
};

/* ── Helper to build multi-photo gallery for each food ─── */
const getItemImages = (item) => {
  if (item.images && item.images.length > 0) return item.images;
  if (!item.image) return [];
  return [
    item.image,
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"
  ];
};

/* ════════════════════════════════════════════════════════
   Swipeable Image Gallery Component (Hero-Style Background)
   ════════════════════════════════════════════════════════ */
const FoodImageGallery = ({ item, isStaff, isFav, toggleFav }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const images = useMemo(() => getItemImages(item), [item]);
  const minSwipeDistance = 35;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      className="jf-gallery-wrap"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {images.length > 0 ? (
        <div
          className="jf-gallery-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${item.name} ${idx + 1}`}
              className="jf-gallery-img"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PLACEHOLDER_IMG;
              }}
            />
          ))}
        </div>
      ) : (
        <div className="jf-card-img-placeholder">
          <span>{item.emoji || "🍲"}</span>
        </div>
      )}

      {/* Dark gradient overlay for text legibility */}
      <div className="jf-card-gradient" />

      {/* Favorite (Heart) Top-Left */}
      <button
        className={`jf-heart-btn${isFav ? " active" : ""}`}
        onClick={toggleFav}
        title={isFav ? "Remove from favorites" : "Save to favorites"}
      >
        <i className={`bi ${isFav ? "bi-heart-fill" : "bi-heart"}`} />
      </button>

      {/* Popular Badge Top-Right */}
      {item.popular && (
        <span className={`jf-popular-badge${isStaff ? " staff" : ""}`}>
          <i className="bi bi-fire" /> Popular
        </span>
      )}

      {/* Desktop Prev / Next Arrows */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button className="jf-gallery-arrow left" onClick={prevImage}>
              <i className="bi bi-chevron-left" />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button className="jf-gallery-arrow right" onClick={nextImage}>
              <i className="bi bi-chevron-right" />
            </button>
          )}
        </>
      )}

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div className="jf-gallery-dots">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`jf-dot${idx === currentIndex ? " active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   Hero-Style Immersive Menu Card Component
   ════════════════════════════════════════════════════════ */
const MenuCard = memo(({ item, isStaff, qty, onCustomize, onAdd, onRemove }) => {
  const [isFav, setIsFav] = useState(false);
  const rating = getRating(item.id);
  const prepTime = getPrepTime(item.id);
  const catEmoji = CAT_EMOJIS[item.cat] || "🍲";
  const canteenName = OUTLETS.find((o) => o.id === item.outletId)?.name || "FUOTUOKE Cafeteria";

  const toggleFav = (e) => {
    e.stopPropagation();
    setIsFav((prev) => !prev);
  };

  return (
    <div
      onClick={() => onCustomize(item)}
      className={`jf-card${isStaff ? " staff" : ""}`}
    >
      {/* ── Full Hero Image Background + Manual Swipe Gallery ── */}
      <FoodImageGallery
        item={item}
        isStaff={isStaff}
        isFav={isFav}
        toggleFav={toggleFav}
      />

      {/* ── Hero Overlaid Content Body ───────────────────── */}
      <div className="jf-card-body">
        {/* Title & Price (Same Line) */}
        <div className="jf-title-price-row">
          <h4 className="jf-card-title">{item.name}</h4>
          <span className={`jf-card-price${isStaff ? " staff" : ""}`}>
            ₦{item.price.toLocaleString()}
          </span>
        </div>

        {/* Restaurant / Canteen Name */}
        <div className="jf-canteen-name">
          <i className="bi bi-shop" style={{ marginRight: 4 }} />
          {canteenName}
        </div>

        {/* Rating, Prep Time, Category Row */}
        <div className="jf-meta-row">
          <span className="jf-meta-item jf-rating">
            <i className="bi bi-star-fill" style={{ color: "#f59e0b" }} />
            <strong>{rating.toFixed(1)}</strong>
          </span>
          <span className="jf-meta-dot">•</span>
          <span className="jf-meta-item">
            <i className="bi bi-clock-history" /> {prepTime}
          </span>
          <span className="jf-meta-dot">•</span>
          <span className="jf-meta-item">
            <span>{catEmoji}</span> {item.cat}
          </span>
        </div>

        {/* Description (2 lines max with ellipsis) */}
        <p className="jf-card-desc">{item.desc}</p>

        {/* Floating (+) Add Button / Qty Control (Bottom-Right) */}
        <div className="jf-card-actions" onClick={(e) => e.stopPropagation()}>
          {qty === 0 ? (
            <button
              className={`jf-floating-add-btn${isStaff ? " staff" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(item);
              }}
              title="Add to cart"
            >
              <i className="bi bi-plus-lg" />
            </button>
          ) : (
            <div className="jf-qty-pill">
              <button
                className={`jf-qty-btn${isStaff ? " staff" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
              >
                <i className="bi bi-dash" />
              </button>
              <span className="jf-qty-val">{qty}</span>
              <button
                className={`jf-qty-btn jf-qty-btn-add${isStaff ? " staff" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(item);
                }}
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
                      <div className="jf-meta-item jf-rating" style={{ fontSize: ".72rem", marginBottom: 4 }}>
                        <i className="bi bi-star-fill" style={{ color: "#f59e0b" }} />
                        <strong>{getRating(item.id).toFixed(1)}</strong>
                      </div>
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
