import React from "react";
import { Badge } from "./ui";

const STEPS = [
  {
    label: "Order Received",
    desc: "Canteen has received your order",
    altLabel: "Order Received",
    altDesc: "Canteen has received your order",
    icon: "bi-inbox-fill",
    eta: "Just now",
  },
  {
    label: "Preparing",
    desc: "Your meal is being freshly cooked",
    altLabel: "Preparing",
    altDesc: "Your meal is being freshly cooked",
    icon: "bi-fire",
    eta: "~10-15 mins",
  },
  {
    label: "Out for Delivery",
    desc: "Rider is on the way to your faculty",
    altLabel: "Ready for Pickup",
    altDesc: "Your order is at the canteen counter",
    icon: "bi-truck",
    eta: "~5-10 mins",
  },
  {
    label: "Delivered",
    desc: "Enjoy your meal! 🎉",
    altLabel: "Picked Up",
    altDesc: "Order complete – enjoy your meal!",
    icon: "bi-check-circle-fill",
    eta: "Done",
  },
];

function getActiveIndex(status) {
  if (status === "Preparing")                                    return 1;
  if (status === "Out for Delivery" || status === "Ready for Pickup") return 2;
  if (status === "Completed")                                    return 3;
  return 0;
}

function getStatusColor(status) {
  if (status === "Completed")    return "green";
  if (status === "Cancelled")    return "red";
  if (status === "Preparing" || status === "Out for Delivery" || status === "Ready for Pickup") return "gold";
  return "blue";
}

export default function OrderTrackerModal({ order, onClose, accent }) {
  const isGold    = accent === "var(--gold)";
  const isPickup  = order.type === "pickup";
  const status    = order.status || "Received";
  const activeIdx = getActiveIndex(status);
  const fillPct   = Math.min((activeIdx / (STEPS.length - 1)) * 100, 100);
  const statusColor = getStatusColor(status);

  return (
    <div className="tracker-fullscreen-backdrop">
      <div className="tracker-fullscreen-panel animate-fade-up">

        {/* ── Header ─────────────────────────────────────── */}
        <div className={`tracker-header${isGold ? " staff" : ""}`}>
          <button className="tracker-close-btn" onClick={onClose} title="Close">
            <i className="bi bi-arrow-left" />
          </button>
          <div className="tracker-header-body">
            <div className="tracker-header-eyebrow">
              <i className="bi bi-geo-alt-fill" style={{ marginRight: 5 }} />
              Live Order Tracking
            </div>
            <h2 className="tracker-header-title">
              Order #{String(order.id).slice(-5)}
            </h2>
            <p className="tracker-header-sub">
              {order.outlet?.name || "Campus Canteen"} &nbsp;·&nbsp;
              <i className={`bi ${isPickup ? "bi-bag-check" : "bi-truck"}`} style={{ marginRight: 4 }} />
              {isPickup ? "Campus Pickup" : `Faculty Delivery → ${order.faculty}`}
            </p>
          </div>
          <Badge color={statusColor}>{status}</Badge>
        </div>

        {/* ── Scrollable body ─────────────────────────────── */}
        <div className="tracker-body">

          {/* ── Live Progress Bar ─────────────────────────── */}
          <div className="tracker-progress-section">
            <div className="tracker-progress-label">
              <span>Order Progress</span>
              <span style={{ color: isGold ? "var(--gold)" : "var(--primary)", fontWeight: 800 }}>
                {Math.round(fillPct)}%
              </span>
            </div>
            <div className="tracker-progress-track">
              <div
                className={`tracker-progress-fill${isGold ? " staff" : ""}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {/* ── Timeline Steps ────────────────────────────── */}
          <div className="tracker-steps-list">
            {STEPS.map((step, idx) => {
              const isPast   = idx < activeIdx;
              const isActive = idx === activeIdx;
              const label    = isPickup ? step.altLabel : step.label;
              const desc     = isPickup ? step.altDesc  : step.desc;

              return (
                <div
                  key={idx}
                  className={`tracker-step${isPast ? " past" + (isGold ? " staff" : "") : ""}${isActive ? " active" + (isGold ? " staff" : "") : ""}${!isPast && !isActive ? " future" : ""}`}
                >
                  {/* Vertical connector line */}
                  {idx < STEPS.length - 1 && (
                    <div className={`tracker-step-line${isPast ? " filled" + (isGold ? " staff" : "") : ""}`} />
                  )}

                  {/* Node */}
                  <div className="tracker-step-node">
                    {isPast ? (
                      <i className="bi bi-check-lg" />
                    ) : (
                      <i className={`bi ${step.icon}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="tracker-step-content">
                    <div className="tracker-step-label">{label}</div>
                    <div className="tracker-step-desc">{desc}</div>
                    {isActive && (
                      <div className={`tracker-step-eta${isGold ? " staff" : ""}`}>
                        <i className="bi bi-clock" style={{ marginRight: 4 }} />
                        {step.eta}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order Info Card ───────────────────────────── */}
          <div className="tracker-info-card">
            <div className="tracker-info-row">
              <div className="tracker-info-item">
                <div className="tracker-info-title">
                  <i className="bi bi-shop" style={{ marginRight: 5 }} />
                  Canteen
                </div>
                <div className="tracker-info-value">{order.outlet?.name || "—"}</div>
              </div>
              <div className="tracker-info-item">
                <div className="tracker-info-title">
                  <i className={`bi ${isPickup ? "bi-bag-check" : "bi-truck"}`} style={{ marginRight: 5 }} />
                  {isPickup ? "Pickup" : "Delivery"}
                </div>
                <div className="tracker-info-value">
                  {isPickup ? "Canteen Counter" : order.faculty || "—"}
                </div>
              </div>
              <div className="tracker-info-item">
                <div className="tracker-info-title">
                  <i className="bi bi-calendar2-check" style={{ marginRight: 5 }} />
                  Ordered
                </div>
                <div className="tracker-info-value">{order.time || "—"}</div>
              </div>
            </div>
          </div>

          {/* ── Order Summary ─────────────────────────────── */}
          <div className="tracker-summary-card">
            <div className="tracker-summary-title">
              <i className="bi bi-receipt-cutoff" style={{ marginRight: 7 }} />
              Order Summary
            </div>
            <div className="tracker-summary-items">
              {order.items.map((item, idx) => (
                <div key={item.id || idx} className="tracker-summary-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border)" }}
                      />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: "1px solid var(--border)" }}>
                        {item.emoji}
                      </div>
                    )}
                    <div>
                      <div className="tracker-summary-name">{item.name}</div>
                      <div className="tracker-summary-qty">× {item.qty}</div>
                    </div>
                  </div>
                  <div className="tracker-summary-price">
                    ₦{(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="tracker-summary-total">
              <span>Total Paid</span>
              <span style={{ color: isGold ? "var(--gold)" : "var(--primary)" }}>
                ₦{order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── Help strip ────────────────────────────────── */}
          {status !== "Completed" && (
            <div className="tracker-help-strip">
              <i className="bi bi-headset" style={{ fontSize: "1.1rem", marginRight: 10 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: ".82rem", color: "var(--text-dark)" }}>Need help?</div>
                <div style={{ fontSize: ".76rem", color: "var(--text-light)" }}>Contact canteen support if your order takes longer than expected.</div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
