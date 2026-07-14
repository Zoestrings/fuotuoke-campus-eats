import React, { useState } from "react";
import { useCustomerController } from "../../controllers/CustomerController";
import MenuBrowse from "../Menu/MenuBrowse";
import MealDetail from "../Menu/MealDetail";
import CartView from "../Cart/CartView";
import OrdersList from "../Orders/OrdersList";
import TrackOrder from "../Orders/TrackOrder";
import ProfileView from "../Profile/ProfileView";
import NotificationsList from "../Notifications/NotificationsList";
import { OUTLETS } from "../../../data";
import { Btn, Badge } from "../../../shared/ui";
import { useToast } from "../../../context/ToastContext";

export default function CustomerDashboard({ onLogoutSuccess }) {
  const { showToast } = useToast();
  const controller = useCustomerController(onLogoutSuccess);
  const {
    user,
    activePage,
    setActivePage,
    menuItems,
    cart,
    orders,
    cartCount,
    cartTotal,
    currentCanteen,
    setCurrentCanteen,
    orderType,
    setOrderType,
    showPayment,
    pendingOrder,
    customizingItem,
    setCustomizingItem,
    trackingOrder,
    setTrackingOrder,
    notifications,
    dismissNotification,
    addToCart,
    removeFromCart,
    placeOrder,
    confirmPayment,
    cancelPayment,
    logout
  } = controller;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Payment modal state — kept in parent to prevent blinking on re-render
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber]       = useState("");
  const [cardName, setCardName]           = useState("");
  const [cardExpiry, setCardExpiry]       = useState("");
  const [cardCVV, setCardCVV]             = useState("");

  const handlePaymentSubmit = () => {
    if (paymentMethod === "card") {
      if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCVV.trim()) {
        showToast("Please fill in all card details", "warning");
        return;
      }
    }
    const res = confirmPayment(paymentMethod === "card" ? "Credit Card" : "Bank Transfer");
    if (res && res.success) {
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCVV("");
      setPaymentMethod("card");
      showToast("Payment successful! Order placed successfully!", "success");
    }
  };

  const isStaff = user.role === "staff";
  const accent = isStaff ? "var(--gold)" : "var(--primary)";
  const badgeColor = isStaff ? "gold" : "blue";

  const navLinks = [
    { key: "home",    icon: "bi-house-door",    label: "Home"    },
    { key: "menu",    icon: "bi-grid",           label: "Menu"    },
    { key: "cart",    icon: "bi-cart3",          label: "Cart"    },
    { key: "orders",  icon: "bi-receipt",        label: "Orders"  },
    { key: "profile", icon: "bi-person-circle",  label: "Profile" }
  ];

  const handleNavClick = (key) => {
    setActivePage(key);
    setDrawerOpen(false);
  };

  const renderSubPage = () => {
    switch (activePage) {
      case "home":    return renderHome();
      case "menu":
        return (
          <MenuBrowse
            isStaff={isStaff} accent={accent}
            outlet={currentCanteen} setOutlet={setCurrentCanteen}
            orderType={orderType} setOType={setOrderType}
            cart={cart}
            addItem={(item) => addToCart(item, 1)}
            removeItem={removeFromCart}
            cartCount={cartCount} cartTotal={cartTotal}
            setPage={setActivePage}
            onCustomizeItem={setCustomizingItem}
            menuItems={menuItems}
          />
        );
      case "cart":
        return (
          <CartView
            isStaff={isStaff} accent={accent}
            cart={cart}
            addItem={(item) => addToCart(item, 1)}
            removeItem={removeFromCart}
            cartCount={cartCount} cartTotal={cartTotal}
            outlet={currentCanteen} setOutlet={setCurrentCanteen}
            orderType={orderType} setOType={setOrderType}
            placeOrder={placeOrder} setPage={setActivePage}
          />
        );
      case "orders":
        return (
          <OrdersList
            isStaff={isStaff} accent={accent}
            orders={orders} setPage={setActivePage}
            onTrackOrder={setTrackingOrder}
          />
        );
      case "profile": return <ProfileView user={user} accent={accent} />;
      default:        return renderHome();
    }
  };

  const renderHome = () => {
    const steps = [
      { icon: "bi-geo-alt-fill",    num: "01", title: "Choose Outlet",   desc: "Pick your nearest campus canteen." },
      { icon: "bi-grid",            num: "02", title: "Select Meals",    desc: "Browse menu and add items to cart." },
      { icon: "bi-truck",           num: "03", title: "Pick Delivery",   desc: "Choose pickup or faculty delivery." },
      { icon: "bi-emoji-smile-fill",num: "04", title: "Enjoy!",          desc: "Your hot meal is freshly cooked." }
    ];
    const popularItems = menuItems.filter(m => m.popular);

    return (
      <div className="dashhome-root">
        {/* Hero */}
        <div className={`dashhome-hero${isStaff ? " staff" : ""}`}>
          <div>FUOTUOKE · Campus Food Ordering</div>
          <h1 className="dashhome-hero-title">
            Feeling Hungry on Campus?{" "}
            <span style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>Order in Minutes.</span>
          </h1>
          <p className="dashhome-hero-sub">
            Hot food from your favourite cafeterias — pickup or delivery right to your faculty.
          </p>
          <div className="dashhome-hero-cta">
            <Btn variant={isStaff ? "gold" : "primary"} onClick={() => setActivePage("menu")} style={{ padding: "13px 32px", fontSize: "1rem" }}>
              <i className="bi bi-grid" /> Browse Menu
            </Btn>
            <Btn variant="ghost" onClick={() => setActivePage("orders")} style={{ padding: "13px 32px", fontSize: "1rem" }}>
              <i className="bi bi-receipt" /> My Orders
            </Btn>
          </div>
        </div>

        {/* How it works */}
        <div className="dashhome-section dashhome-section-white dashhome-section-center">
          <Badge color={badgeColor}>Simple steps</Badge>
          <h2 className="dashhome-section-title">How it works</h2>
          <div className="dashhome-steps-grid">
            {steps.map((s, i) => (
              <div key={i} className={`dashhome-step-card${isStaff ? " staff" : ""}`}>
                <div className={`dashhome-step-icon-wrap${isStaff ? " staff" : ""}`}>
                  <i className={`bi ${s.icon}`} />
                </div>
                <div className="dashhome-step-num" style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>Step {s.num}</div>
                <h4 className="dashhome-step-title">{s.title}</h4>
                <p className="dashhome-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Canteens */}
        <div className="dashhome-section dashhome-section-tinted">
          <div className="dashhome-section-inner">
            <Badge color={badgeColor}>On campus</Badge>
            <h2 className="dashhome-section-title">Our Canteens &amp; Cafeterias</h2>
            <div className="dashhome-canteen-grid">
              {OUTLETS.map(o => (
                <div
                  key={o.id}
                  onClick={() => { setCurrentCanteen(o.id); setActivePage("menu"); }}
                  className={`dashhome-canteen-card${currentCanteen === o.id ? (isStaff ? " active-staff" : " active-student") : ""}`}
                  style={{ borderColor: currentCanteen === o.id ? (isStaff ? "var(--gold)" : "var(--primary)") : "var(--border)" }}
                >
                  <i className={`bi ${o.biIcon || "bi-shop"} dashhome-canteen-icon`} style={{ color: currentCanteen === o.id ? (isStaff ? "var(--gold)" : "var(--primary)") : "var(--text-muted)" }} />
                  <h4 className="dashhome-canteen-name">{o.name}</h4>
                  <p className="dashhome-canteen-loc">{o.loc}</p>
                  <p className="dashhome-canteen-time" style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>
                    <i className="bi bi-clock" style={{ marginRight: 4 }} />
                    {o.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular */}
        <div className="dashhome-section dashhome-section-white">
          <div className="dashhome-section-inner">
            <Badge color={badgeColor}>Most ordered</Badge>
            <div className="dashhome-popular-header">
              <h2 className="dashhome-section-title" style={{ marginBottom: 0 }}>Popular Right Now</h2>
              <Btn sm variant={isStaff ? "gold" : "primary"} onClick={() => setActivePage("menu")}>
                View Full Menu <i className="bi bi-arrow-right" />
              </Btn>
            </div>
            {popularItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 20px", background: "#f8fafc", borderRadius: 14, border: "1px dashed var(--border)" }}>
                <i className="bi bi-egg-fried" style={{ fontSize: "2.5rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }} />
                <p style={{ color: "var(--text-light)", fontSize: ".88rem", margin: 0 }}>No featured popular meals at the moment.</p>
              </div>
            ) : (
              <div className="dashhome-popular-grid">
                {popularItems.slice(0, 4).map(item => (
                  <div key={item.id} className={`dashhome-popular-card${isStaff ? " staff" : ""}`}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="item-img-card" loading="lazy" />
                    ) : (
                      <div className="item-emoji-card">{item.emoji}</div>
                    )}
                    <div className="dashhome-popular-name">{item.name}</div>
                    <div className="dashhome-popular-desc">{item.desc}</div>
                    <div className="dashhome-popular-footer">
                      <span className="dashhome-popular-price" style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>₦{item.price.toLocaleString()}</span>
                      <Btn sm variant={isStaff ? "gold" : "primary"} onClick={() => addToCart(item, 1)}>
                        <i className="bi bi-plus" /> Add
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const activeTrackOrder = trackingOrder ? orders.find(o => o.id === trackingOrder.id) : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)", paddingBottom: 60 }}>

      {/* ── Top Navigation Bar ─────────────────────────── */}
      <nav className={`navbar${isStaff ? " staff" : ""}`}>
        {/* Brand */}
        <div className="nav-brand" onClick={() => setActivePage("home")} style={{ cursor: "pointer" }}>
          <img src="/FUO_Logo.png" alt="Logo" className="nav-brand-img" style={{ width: 34, height: 34, objectFit: "contain" }} />
          <div>
            <div className="nav-brand-title">FUOTUOKE Campus Eats</div>
            <div className="nav-brand-subtitle">Federal University Otuoke</div>
          </div>
        </div>

        {/* Desktop nav links (hidden on mobile via CSS) */}
        <div className="nav-links">
          {navLinks.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`nav-btn${activePage === key ? ` active${isStaff ? " staff" : ""}` : ""}`}
              onClick={() => setActivePage(key)}
            >
              <i className={`bi ${icon}`} style={{ fontSize: "1rem" }} />
              {label}
              {key === "cart" && cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
            </button>
          ))}

          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.12)", margin: "0 4px" }} />

          <div className="nav-user-info">
            <i className={`bi ${isStaff ? "bi-briefcase" : "bi-mortarboard"}`} style={{ fontSize: "1rem", color: isStaff ? "var(--gold)" : "var(--primary)", opacity: 0.9 }} />
            <span className="nav-user-name">{user.name?.split(" ")[0] || "User"}</span>
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
                  <p style={{ fontSize: ".78rem", color: "var(--text-light)", margin: "4px 0 0" }}>You will need to sign in again to order meals.</p>
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

        {/* Mobile hamburger (visible only on mobile via CSS) */}
        <button
          id="nav-hamburger-btn"
          className="nav-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
        >
          <i className="bi bi-list" />
        </button>
      </nav>

      {/* ── Mobile Nav Drawer ──────────────────────────── */}
      {/* Backdrop overlay */}
      <div
        className={`nav-drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        id="mobile-nav-drawer"
        className={`nav-drawer${isStaff ? " staff" : ""}${drawerOpen ? " open" : ""}`}
        aria-label="Mobile navigation menu"
      >
        {/* Drawer header */}
        <div className="nav-drawer-header">
          <div className="nav-drawer-brand">
            <img src="/FUO_Logo.png" alt="Logo" />
            <span className="nav-drawer-brand-title">Campus Eats</span>
          </div>
          <button className="nav-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* User info strip */}
        <div className="nav-drawer-user">
          <div className="nav-drawer-user-avatar" style={{ color: isStaff ? "var(--gold)" : "var(--primary-mid)" }}>
            <i className={`bi ${isStaff ? "bi-briefcase" : "bi-mortarboard"}`} />
          </div>
          <div>
            <div className="nav-drawer-user-name">{user.name || "User"}</div>
            <div className="nav-drawer-user-role">{user.role || "Student"}</div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="nav-drawer-links">
          {navLinks.map(({ key, icon, label }) => (
            <button
              key={key}
              id={`drawer-nav-${key}`}
              className={`nav-drawer-item${activePage === key ? ` active${isStaff ? " staff" : ""}` : ""}`}
              onClick={() => handleNavClick(key)}
            >
              <i className={`bi ${icon}`} />
              {label}
              {key === "cart" && cartCount > 0 && <span className="nav-badge-count">{cartCount}</span>}
            </button>
          ))}
        </div>

        {/* Sign-out button */}
        <div className="nav-drawer-footer">
          <button id="drawer-logout-btn" className="nav-drawer-logout" onClick={() => { setDrawerOpen(false); logout(); }}>
            <i className="bi bi-box-arrow-right" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Page Content ───────────────────────────────── */}
      {renderSubPage()}

      {/* ── Bottom Tab Bar (mobile only, shown via CSS) ── */}
      <nav
        id="bottom-tab-bar"
        className={`bottom-tab-bar${isStaff ? " staff" : ""}`}
        aria-label="Bottom navigation"
      >
        <div className="bottom-tab-bar-inner">
          {navLinks.map(({ key, icon, label }) => (
            <button
              key={key}
              id={`bottom-tab-${key}`}
              className={`bottom-tab-item${activePage === key ? ` active${isStaff ? " staff" : ""}` : ""}`}
              onClick={() => setActivePage(key)}
              aria-label={label}
            >
              <i className={`bi ${icon}`} />
              <span>{label}</span>
              {key === "cart" && cartCount > 0 && <span className="bottom-tab-badge">{cartCount}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Payment Modal ──────────────────────────────── */}
      {showPayment && (
        <div className="pay-modal-backdrop">
          <div className="pay-modal-content animate-scale-in">
            <div className={`pay-modal-header ${isStaff ? "staff" : "primary"}`}>
              <h2 className="pay-modal-title">Secure Checkout</h2>
              <p className="pay-modal-subtitle">Total: ₦{pendingOrder?.total.toLocaleString()}</p>
            </div>
            <div className="pay-modal-body">
              <p className="pay-details-title">Payment Method</p>
              <div className="pay-method-row">
                <div onClick={() => setPaymentMethod("card")} className={`pay-method-card${paymentMethod === "card" ? (isStaff ? " active-gold" : " active-primary") : ""}`}>
                  <i className="bi bi-credit-card pay-method-icon" />
                  <span className="pay-method-label">Credit Card</span>
                </div>
                <div onClick={() => setPaymentMethod("transfer")} className={`pay-method-card${paymentMethod === "transfer" ? (isStaff ? " active-gold" : " active-primary") : ""}`}>
                  <i className="bi bi-bank pay-method-icon" />
                  <span className="pay-method-label">Bank Transfer</span>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="pay-details-box">
                  <p className="pay-details-title">Card Details</p>
                  <input placeholder="Card Number (16 digits)" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))} maxLength="16" className="form-input" style={{ marginBottom: 10, fontFamily: "monospace" }} />
                  <input placeholder="Cardholder Name" value={cardName} onChange={e => setCardName(e.target.value)} className="form-input" style={{ marginBottom: 10 }} />
                  <div className="pay-row">
                    <input placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength="5" className="form-input" />
                    <input placeholder="CVV" value={cardCVV} onChange={e => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 3))} maxLength="3" className="form-input" style={{ fontFamily: "monospace" }} />
                  </div>
                </div>
              )}

              {paymentMethod === "transfer" && (
                <div className="pay-details-box" style={{ textAlign: "center" }}>
                  <p className="pay-details-title">Bank Transfer Details</p>
                  <p className="pay-transfer-info">
                    Transfer ₦{pendingOrder?.total.toLocaleString()} to:<br />
                    <strong>Bank:</strong> First Bank Nigeria<br />
                    <strong>Account Name:</strong> FUOTUOKE Campus Eats Ltd.<br />
                    <span className="pay-transfer-highlight">Account No: 1234567890</span>
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={cancelPayment} className="btn btn-outline" style={{ flex: 1, padding: "12px 0", fontSize: ".85rem" }}>Cancel</button>
                <button onClick={handlePaymentSubmit} className={`btn btn-${isStaff ? "gold" : "primary"}`} style={{ flex: 1, padding: "12px 0", fontSize: ".85rem" }}>Confirm Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal detail modal */}
      {customizingItem && (
        <MealDetail item={customizingItem} onClose={() => setCustomizingItem(null)} onAdd={addToCart} accent={accent} />
      )}

      {/* Order tracker modal */}
      {trackingOrder && (
        <TrackOrder order={trackingOrder} onClose={() => setTrackingOrder(null)} accent={accent} />
      )}

      {/* Floating notifications */}
      <NotificationsList list={notifications} onDismiss={dismissNotification} />
    </div>
  );
}
