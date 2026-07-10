import React, { useState } from "react";
import { OUTLETS, FACULTIES } from "../../../data";
import { Btn } from "../../../shared/ui";
import { useToast } from "../../../context/ToastContext";

const SectionCard = ({ children }) => (
  <div style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", marginBottom: 14, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
    {children}
  </div>
);

export default function CartView({ isStaff, accent, cart, addItem, removeItem, cartCount, cartTotal, outlet, setOutlet, orderType, setOType, placeOrder, setPage }) {
  const { showToast } = useToast();
  const [faculty, setFaculty] = useState("");

  const handlePlaceOrder = () => {
    if (orderType === "delivery" && !faculty) {
      showToast("Please select a Faculty for delivery.", "warning");
      return;
    }
    placeOrder(faculty);
  };

  return (
    <div className="page-bg animate-fade-in">
      <div className="page-content-small">

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem,3vw,1.9rem)", fontWeight: 900, color: "var(--text-dark)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <i className="bi bi-cart3" style={{ color: accent }} />
          Your Cart
        </h2>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px", background: "#fff", borderRadius: 16, border: "1px solid var(--border)" }}>
            <i className="bi bi-cart-x" style={{ fontSize: "3.5rem", color: "var(--text-muted)", marginBottom: 16, display: "block" }} />
            <p style={{ color: "var(--text-light)", marginBottom: 20, fontWeight: 600 }}>Your cart is empty</p>
            <Btn variant={isStaff ? "gold" : "primary"} onClick={() => setPage("menu")}>
              <i className="bi bi-grid" /> Browse Menu
            </Btn>
          </div>
        ) : (
          <>
            {/* Canteen selector */}
            <SectionCard>
              <p style={{ fontSize: ".73rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: 12 }}>
                <i className="bi bi-shop" style={{ marginRight: 5 }} />Canteen / Outlet
              </p>
              <div className="filters-row" style={{ marginBottom: 0 }}>
                {OUTLETS.map(o => (
                  <button
                    key={o.id}
                    className={`filter-btn${outlet === o.id ? (isStaff ? " active-gold" : " active-primary") : ""}`}
                    onClick={() => setOutlet(o.id)}
                  >
                    <i className={`bi ${o.biIcon || "bi-shop"}`} style={{ marginRight: 5 }} />
                    {o.name}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Order type */}
            <SectionCard>
              <p style={{ fontSize: ".73rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: 12 }}>
                <i className="bi bi-signpost-2" style={{ marginRight: 5 }} />Order Type
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  ["pickup", "bi-bag-check", "Pickup"],
                  ["delivery", "bi-truck", "Faculty Delivery"],
                ].map(([val, icon, label]) => (
                  <button
                    key={val}
                    onClick={() => setOType(val)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 0", border: `1.5px solid ${orderType === val ? (isStaff ? "var(--gold)" : "var(--primary)") : "var(--border)"}`, borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: ".84rem", background: orderType === val ? (isStaff ? "var(--gold-light)" : "var(--primary-light)") : "#fff", color: orderType === val ? (isStaff ? "var(--gold)" : "var(--primary)") : "var(--text-light)", transition: "all .15s" }}
                  >
                    <i className={`bi ${icon}`} /> {label}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Faculty select */}
            {orderType === "delivery" && (
              <SectionCard>
                <p style={{ fontSize: ".73rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: 12 }}>
                  <i className="bi bi-geo-alt" style={{ marginRight: 5 }} />
                  Delivery Faculty <span style={{ color: "var(--red)" }}>*</span>
                </p>
                <select
                  value={faculty}
                  onChange={e => setFaculty(e.target.value)}
                  className="form-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="">— Choose your Faculty —</option>
                  {FACULTIES.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                </select>
              </SectionCard>
            )}

            {/* Cart items */}
            <SectionCard>
              <p style={{ fontSize: ".73rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: 16 }}>
                <i className="bi bi-list-ul" style={{ marginRight: 5 }} />Items ({cartCount})
              </p>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="item-img-thumb" loading="lazy" />
                    ) : (
                      <span className="item-emoji-thumb">{item.emoji}</span>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: ".88rem", color: "var(--text-dark)" }}>{item.name}</div>
                      <div style={{ fontSize: ".76rem", color: "var(--text-light)" }}>₦{item.price.toLocaleString()} each</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="qty-adjuster">
                      <button
                        className="qty-btn"
                        style={{ width: 26, height: 26, border: `1.5px solid ${isStaff ? "var(--gold)" : "var(--primary)"}`, color: isStaff ? "var(--gold)" : "var(--primary)" }}
                        onClick={() => removeItem(item.id)}
                      >
                        <i className="bi bi-dash" style={{ fontSize: ".85rem" }} />
                      </button>
                      <span style={{ fontWeight: 800, minWidth: 16, textAlign: "center", color: "var(--text-dark)" }}>{item.qty}</span>
                      <button
                        className={`qty-btn-filled${isStaff ? " staff" : ""}`}
                        style={{ width: 26, height: 26 }}
                        onClick={() => addItem(item)}
                      >
                        <i className="bi bi-plus" style={{ fontSize: ".85rem" }} />
                      </button>
                    </div>
                    <span style={{ fontWeight: 800, color: isStaff ? "var(--gold)" : "var(--primary)", minWidth: 82, textAlign: "right", fontSize: ".9rem" }}>
                      ₦{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, fontWeight: 800, fontSize: "1rem", color: "var(--text-dark)" }}>
                <span>Order Total</span>
                <span style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>₦{cartTotal.toLocaleString()}</span>
              </div>
            </SectionCard>

            {/* Place order */}
            <Btn full variant={isStaff ? "gold" : "primary"} onClick={handlePlaceOrder} style={{ padding: "14px 0", fontSize: ".95rem" }}>
              <i className="bi bi-check-circle-fill" /> Place Order · ₦{cartTotal.toLocaleString()}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}
