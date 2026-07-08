import React, { useState } from "react";
import { Badge, Btn } from "../../../shared/ui";
import { OrderService } from "../../services/OrderService";
import { useToast } from "../../../context/ToastContext";

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
  if (status === "Preparing") return 1;
  if (status === "Out for Delivery" || status === "Ready for Pickup") return 2;
  if (status === "Completed") return 3;
  return 0;
}

function getStatusColor(status) {
  if (status === "Completed") return "green";
  if (status === "Cancelled") return "red";
  if (status === "Preparing" || status === "Out for Delivery" || status === "Ready for Pickup") return "gold";
  return "blue";
}

export default function TrackOrder({ order, onClose, accent }) {
  const { showToast } = useToast();
  const isGold = accent === "var(--gold)";
  const isPickup = order.type === "pickup";
  const status = order.status || "Received";
  const activeIdx = getActiveIndex(status);
  const fillPct = Math.min((activeIdx / (STEPS.length - 1)) * 100, 100);
  const statusColor = getStatusColor(status);

  const [userRating, setUserRating] = useState(order.rating || 0);
  const [reviewText, setReviewText] = useState(order.review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleReviewSubmit = async () => {
    if (userRating === 0) {
      showToast("Please select a rating from 1 to 5 stars.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      await OrderService.submitOrderReview(order.id, userRating, reviewText);
      setSuccessMsg("Thank you! Your rating and review has been saved.");
      showToast("Thank you! Your review has been saved.", "success");
    } catch (e) {
      showToast("Failed to submit review.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tracker-fullscreen-backdrop" style={{ zIndex: 4000 }}>
      <div className="tracker-fullscreen-panel animate-fade-up">

        {/* Header */}
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

        {/* Scrollable body */}
        <div className="tracker-body">

          {/* Live GPS Campus Tracker Map (Only if Delivery and Out for Delivery / Completed) */}
          {order.type === "delivery" && ["Out for Delivery", "Completed"].includes(status) && (
            <div className="tracker-summary-card" style={{ marginBottom: 20, padding: 16, background: "#f8fafc", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: ".8rem", fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                <i className="bi bi-geo-alt-fill" style={{ marginRight: 6, color: "var(--red-text)" }} />
                Live Campus GPS Map (FUOTUOKE Campus)
              </div>
              
              <div style={{ position: "relative", width: "100%", height: 160, background: "#e2e8f0", borderRadius: 10, border: "1px solid var(--border)" }}>
                <svg width="100%" height="100%" viewBox="0 0 400 160" style={{ display: "block" }}>
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Stylized road/path */}
                  {(() => {
                    const facultyName = order.faculty || "";
                    const getCoords = (name) => {
                      const lower = name.toLowerCase();
                      if (lower.includes("science")) return { x: 320, y: 30, label: "Science Faculty" };
                      if (lower.includes("humanities") || lower.includes("hss") || lower.includes("social")) return { x: 320, y: 130, label: "Humanities Faculty" };
                      if (lower.includes("management") || lower.includes("admin")) return { x: 320, y: 80, label: "Management Sciences" };
                      return { x: 320, y: 80, label: name || "Your Faculty" };
                    };
                    const dest = getCoords(facultyName);
                    const startX = 60;
                    const startY = 80;
                    const endX = dest.x;
                    const endY = dest.y;
                    const controlX = 180;
                    const controlY = endY - 20;

                    const progress = order.deliveryProgress || 0;
                    const t = progress / 100;
                    const bikeX = Math.round(Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX);
                    const bikeY = Math.round(Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY);

                    return (
                      <>
                        <path
                          d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="3"
                          strokeDasharray="6,4"
                          opacity="0.3"
                        />
                        {/* Canteen Node */}
                        <circle cx={startX} cy={startY} r="8" fill="var(--gold)" stroke="#fff" strokeWidth="2" />
                        <text x={startX - 45} y={startY + 22} fontSize="9" fontWeight="800" fill="var(--text-dark)">{order.outlet?.name || "Canteen"}</text>

                        {/* Faculty Node */}
                        <circle cx={endX} cy={endY} r="8" fill="var(--green-text)" stroke="#fff" strokeWidth="2" />
                        <text x={endX - 45} y={endY + 22} fontSize="9" fontWeight="800" fill="var(--text-dark)">{dest.label}</text>

                        {/* Rider Bike */}
                        <g transform={`translate(${bikeX - 10}, ${bikeY - 10})`}>
                          <circle cx="10" cy="10" r="12" fill="#2563eb" opacity="0.15" />
                          <circle cx="10" cy="10" r="8" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                          <text x="3.5" y="13.5" fontSize="9" fill="#fff">🚴</text>
                        </g>
                      </>
                    );
                  })()}
                </svg>

                {/* Info strip overlay */}
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: 6, fontSize: ".72rem", border: "1px solid var(--border)", fontWeight: 700, color: "var(--text-dark)" }}>
                  {order.deliveryProgress === 100 ? (
                    <span style={{ color: "var(--green-text)" }}><i className="bi bi-check-circle-fill" /> Arrived at Faculty!</span>
                  ) : (
                    <span><i className="bi bi-bicycle" style={{ marginRight: 4 }} /> Rider is {100 - (order.deliveryProgress || 0)}% away...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Progress Bar */}
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

          {/* Timeline Steps */}
          <div className="tracker-steps-list">
            {STEPS.map((step, idx) => {
              const isPast = idx < activeIdx;
              const isActive = idx === activeIdx;
              const label = isPickup ? step.altLabel : step.label;
              const desc = isPickup ? step.altDesc : step.desc;

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

          {/* Order Info Card */}
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

          {/* Rider Info Card (Only if delivery and rider is assigned) */}
          {!isPickup && order.assignedRiderName && (
            <div className="tracker-info-card" style={{ marginTop: 14, background: "rgba(37, 99, 235, 0.04)", border: "1px solid rgba(37, 99, 235, 0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.2rem" }}>
                  <i className="bi bi-person-badge-fill" />
                </div>
                <div>
                  <div style={{ fontSize: ".76rem", color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Delivery Rider Assigned</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-dark)" }}>{order.assignedRiderName}</div>
                  <div style={{ fontSize: ".82rem", color: "var(--text-muted)", marginTop: 2 }}>
                    <i className="bi bi-telephone-fill" style={{ marginRight: 6, color: "var(--primary)" }} />
                    <a href={`tel:${order.assignedRiderPhone}`} style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}>
                      {order.assignedRiderPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
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

          {/* Rating and Review Card (only when status is Completed) */}
          {status === "Completed" && (
            <div className="tracker-summary-card" style={{ marginTop: 20, padding: 18, background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <div style={{ fontSize: ".88rem", fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <i className="bi bi-star-fill" style={{ color: "var(--gold)" }} />
                {(order.rating > 0 || successMsg) ? "Your Rating & Review" : "Rate Your Meal & Service"}
              </div>

              {(order.rating > 0 || successMsg) ? (
                <div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8, fontSize: "1.1rem" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <i
                        key={star}
                        className={`bi ${star <= (order.rating || userRating) ? "bi-star-fill" : "bi-star"}`}
                        style={{ color: "var(--gold)" }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: ".86rem", color: "var(--text-dark)", margin: 0, fontStyle: "italic" }}>
                    "{order.review || reviewText || "No comment left."}"
                  </p>
                  {successMsg && (
                    <span style={{ fontSize: ".76rem", color: "var(--green-text)", display: "block", marginTop: 6, fontWeight: 700 }}>
                      <i className="bi bi-check-circle-fill" /> {successMsg}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8, fontSize: "1.5rem" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <i
                        key={star}
                        className={`bi ${star <= userRating ? "bi-star-fill" : "bi-star"}`}
                        style={{ color: "var(--gold)", cursor: "pointer" }}
                        onClick={() => setUserRating(star)}
                      />
                    ))}
                  </div>
                  <textarea
                    className="form-input"
                    placeholder="Tell us what you liked or how we can improve..."
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows="2"
                    style={{ fontSize: ".84rem", padding: 10, resize: "none" }}
                  />
                  <Btn sm variant="green" onClick={handleReviewSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Btn>
                </div>
              )}
            </div>
          )}

          {/* Help strip */}
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
