import React, { useState } from "react";
import TopNav from "./TopNav";
import DashHome from "../pages/DashHome";
import DashMenu from "../pages/DashMenu";
import DashCart from "../pages/DashCart";
import DashOrders from "../pages/DashOrders";
import DishModal from "./DishModal";
import OrderTrackerModal from "./OrderTrackerModal";

export default function FoodDashboard({ user, onLogout, menuItems, setMenuItems, orders, setOrders }) {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [outlet, setOutlet] = useState(null);
  const [orderType, setOType] = useState("pickup");
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  
  // Customization & Tracking modal states
  const [customizingItem, setCustomizingItem] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  // Payment modal state — kept in parent to prevent blinking on re-render
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber]       = useState("");
  const [cardName, setCardName]           = useState("");
  const [cardExpiry, setCardExpiry]       = useState("");
  const [cardCVV, setCardCVV]             = useState("");

  const accent = (user.isStaff || user.role === "staff") ? "var(--gold)" : "var(--blue)";

  const addCustomItem = (customizedItem, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(x => x.id === customizedItem.id);
      return existing 
        ? prev.map(x => x.id === customizedItem.id ? { ...x, qty: x.qty + quantity } : x) 
        : [...prev, { ...customizedItem, qty: quantity }];
    });
  };

  const addItem = item => {
    // Treat direct add (e.g. from homepage cards) as item with no extras
    addCustomItem(item, 1);
  };

  const removeItem = id => {
    setCart(prev => {
      const existing = prev.find(x => x.id === id);
      return existing?.qty === 1 ? prev.filter(x => x.id !== id) : prev.map(x => x.id === id ? { ...x, qty: x.qty - 1 } : x);
    });
  };

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const cartTotal = cart.reduce((s, x) => s + x.price * x.qty, 0);

  const placeOrder = (faculty) => {
    if (!outlet) { alert("Please select a canteen"); return; }
    
    // Resolve outlet name
    const outletNames = { a: "Main Cafeteria", b: "Engineering Canteen", c: "Student Union Buka", d: "Science Cafeteria" };
    const outletName = outletNames[outlet] || outlet;
    
    const order = { 
      id: Date.now(), 
      items: cart, 
      total: cartTotal, 
      outlet: { name: outletName }, 
      type: orderType, 
      faculty: orderType === "delivery" ? faculty : null,
      status: "Received",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
    };
    setPendingOrder(order);
    setShowPayment(true);
  };

  const confirmPayment = (method) => {
    if (pendingOrder) {
      const orderWithPayment = {
        ...pendingOrder,
        paymentMethod: method || "Credit Card"
      };
      setOrders(prev => [orderWithPayment, ...prev]);
      setCart([]);
      setShowPayment(false);
      setPendingOrder(null);
      setPage("orders");
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCVV("");
      setPaymentMethod("card");
      alert("Payment successful! Order placed successfully!");
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "card") {
      if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCVV.trim()) {
        alert("Please fill in all card details");
        return;
      }
    }
    confirmPayment(paymentMethod === "card" ? "Credit Card" : "Bank Transfer");
  };

  const renderPage = () => {
    switch (page) {
      case "home": return <DashHome isStaff={user.isStaff} accent={accent} outlet={outlet} setOutlet={setOutlet} setPage={setPage} addItem={addItem} menuItems={menuItems} />;
      case "menu": return <DashMenu isStaff={user.isStaff} accent={accent} outlet={outlet} setOutlet={setOutlet} orderType={orderType} setOType={setOType} cart={cart} addItem={addItem} removeItem={removeItem} cartCount={cartCount} cartTotal={cartTotal} setPage={setPage} onCustomizeItem={setCustomizingItem} menuItems={menuItems} />;
      case "cart": return <DashCart isStaff={user.isStaff} accent={accent} cart={cart} addItem={addItem} removeItem={removeItem} cartCount={cartCount} cartTotal={cartTotal} outlet={outlet} setOutlet={setOutlet} orderType={orderType} setOType={setOType} placeOrder={placeOrder} setPage={setPage} />;
      case "orders": return <DashOrders isStaff={user.isStaff} accent={accent} orders={orders} setPage={setPage} onTrackOrder={setTrackingOrder} />;
      default: return <DashHome isStaff={user.isStaff} accent={accent} outlet={outlet} setOutlet={setOutlet} setPage={setPage} addItem={addItem} menuItems={menuItems} />;
    }
  };


  const activeTrackOrder = trackingOrder ? orders.find(o => o.id === trackingOrder.id) : null;

  return (
    <div>
      <TopNav user={user} page={page} setPage={setPage} cartCount={cartCount} onLogout={onLogout} />
      {renderPage()}
      {showPayment && (() => {
        const isGold = user.isStaff || user.role === "staff";
        return (
          <div className="pay-modal-backdrop">
            <div className="pay-modal-content">
              <div className={`pay-modal-header ${isGold ? "staff" : "primary"}`}>
                <h2 className="pay-modal-title">Secure Checkout</h2>
                <p className="pay-modal-subtitle">Total: ₦{pendingOrder?.total.toLocaleString()}</p>
              </div>

              <div className="pay-modal-body">
                <p className="pay-details-title">Payment Method</p>
                <div className="pay-method-row">
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`pay-method-card${paymentMethod === "card" ? (isGold ? " active-gold" : " active-primary") : ""}`}
                  >
                    <i className="bi bi-credit-card pay-method-icon" />
                    <span className="pay-method-label">Credit Card</span>
                  </div>
                  <div
                    onClick={() => setPaymentMethod("transfer")}
                    className={`pay-method-card${paymentMethod === "transfer" ? (isGold ? " active-gold" : " active-primary") : ""}`}
                  >
                    <i className="bi bi-bank pay-method-icon" />
                    <span className="pay-method-label">Bank Transfer</span>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="pay-details-box">
                    <p className="pay-details-title">Card Details</p>
                    <input
                      placeholder="Card Number (16 digits)"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      maxLength="16"
                      className="form-input"
                      style={{ marginBottom: 10, fontFamily: "monospace" }}
                    />
                    <input
                      placeholder="Cardholder Name"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="form-input"
                      style={{ marginBottom: 10 }}
                    />
                    <div className="pay-row">
                      <input
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        maxLength="5"
                        className="form-input"
                      />
                      <input
                        placeholder="CVV"
                        value={cardCVV}
                        onChange={e => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        maxLength="3"
                        className="form-input"
                        style={{ fontFamily: "monospace" }}
                      />
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

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: "12px 0", fontSize: ".85rem" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    className={`btn btn-${isGold ? "gold" : "primary"}`}
                    style={{ flex: 1, padding: "12px 0", fontSize: ".85rem" }}
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {customizingItem && (
        <DishModal 
          item={customizingItem} 
          onClose={() => setCustomizingItem(null)} 
          onAdd={addCustomItem} 
          accent={accent} 
        />
      )}
      {activeTrackOrder && (
        <OrderTrackerModal 
          order={activeTrackOrder} 
          onClose={() => setTrackingOrder(null)} 
          accent={accent} 
        />
      )}
    </div>
  );
}
