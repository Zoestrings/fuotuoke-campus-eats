import React, { useState } from "react";
import { Btn } from "../../../shared/ui";

export default function MealDetail({ item, onClose, onAdd, accent }) {
  const [qty, setQty] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const isGold = accent === "var(--gold)";

  const toggleExtra = (extra) => {
    setSelectedExtras(prev =>
      prev.some(x => x.name === extra.name)
        ? prev.filter(x => x.name !== extra.name)
        : [...prev, extra]
    );
  };

  const extraTotal = selectedExtras.reduce((s, x) => s + x.price, 0);
  const singlePrice = item.price + extraTotal;
  const totalPrice = singlePrice * qty;

  const handleAdd = () => {
    const customized = {
      ...item,
      id: selectedExtras.length ? `${item.id}-${selectedExtras.map(x => x.name).sort().join("-")}` : item.id,
      baseId: item.id,
      name: selectedExtras.length ? `${item.name} (${selectedExtras.map(x => x.name).join(", ")})` : item.name,
      price: singlePrice,
      selectedExtras,
    };
    onAdd(customized, qty);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 3000 }}>
      <div className="modal-content animate-fade-up" style={{ maxWidth: 460 }}>

        {/* Header */}
        <div className={`modal-header${isGold ? " staff" : ""}`}>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
            {item.image ? (
              <img src={item.image} alt={item.name} className="item-img-modal" loading="lazy" />
            ) : (
              <span className="item-emoji-modal">{item.emoji}</span>
            )}
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 900, color: "#fff", margin: 0 }}>{item.name}</h2>
              <span className={`badge ${isGold ? "badge-gold" : "badge-blue"}`} style={{ marginTop: 6 }}>{item.cat}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: ".88rem", color: "var(--text-light)", lineHeight: 1.6, marginBottom: 20 }}>{item.desc}</p>

          {/* Extras */}
          {item.extras?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: ".75rem", fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                <i className="bi bi-sliders" style={{ marginRight: 6 }} />
                Customise Your Meal
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {item.extras.map(extra => {
                  const checked = selectedExtras.some(x => x.name === extra.name);
                  return (
                    <label
                      key={extra.name}
                      className={`custom-label-box${checked ? (isGold ? " active-gold" : " active-primary") : ""}`}
                      onClick={() => toggleExtra(extra)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? (isGold ? "var(--gold)" : "var(--primary)") : "var(--border)"}`, background: checked ? (isGold ? "var(--gold)" : "var(--primary)") : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                          {checked && <i className="bi bi-check" style={{ color: "#fff", fontSize: ".75rem" }} />}
                        </div>
                        <span style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--text-dark)" }}>{extra.name}</span>
                      </div>
                      <span style={{ fontSize: ".85rem", fontWeight: 700, color: isGold ? "var(--gold)" : "var(--primary)" }}>
                        +₦{extra.price.toLocaleString()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info strip */}
          <div className="info-banner" style={{ marginBottom: 20 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bi bi-clock" /> <span><strong>Prep:</strong> 10–15 min</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bi bi-fire" /> <span><strong>Served:</strong> Fresh &amp; Hot</span>
            </span>
          </div>

          {/* Qty adjuster */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: ".9rem" }}>Quantity</span>
            <div className="qty-adjuster">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>
                <i className="bi bi-dash" />
              </button>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", minWidth: 24, textAlign: "center", color: "var(--text-dark)" }}>{qty}</span>
              <button className={`qty-btn-filled${isGold ? " staff" : ""}`} onClick={() => setQty(q => q + 1)}>
                <i className="bi bi-plus" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: ".7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: isGold ? "var(--gold)" : "var(--primary)" }}>
              ₦{totalPrice.toLocaleString()}
            </div>
          </div>
          <Btn onClick={handleAdd} variant={isGold ? "gold" : "primary"} style={{ padding: "12px 24px" }}>
            <i className="bi bi-cart-plus" /> Add to Cart
          </Btn>
        </div>

      </div>
    </div>
  );
}
