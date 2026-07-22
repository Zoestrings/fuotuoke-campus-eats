import React, { useState, useEffect, useRef } from "react";
import { Badge, Btn } from "../../../shared/ui";
import { OrderService } from "../../services/OrderService";
import { useToast } from "../../../context/ToastContext";
import { getCoordsForLabel, CANTEEN_COORDS } from "../../../CampusLocations";

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

function getDestinationCoords(order) {
  // 1. Prefer saved GPS coords from order
  if (order.latitude && order.longitude) {
    return { lat: parseFloat(order.latitude), lng: parseFloat(order.longitude), label: order.formattedAddress || "Your Location" };
  }
  // 2. Use formattedAddress to look up campus location
  if (order.formattedAddress) {
    const coords = getCoordsForLabel(order.formattedAddress);
    return { ...coords, label: order.formattedAddress };
  }
  // 3. Fall back to faculty keyword lookup
  if (order.faculty) {
    const coords = getCoordsForLabel(order.faculty);
    return { ...coords, label: order.faculty };
  }
  return { lat: CANTEEN_COORDS.lat, lng: CANTEEN_COORDS.lng, label: "Your Campus Location" };
}

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

  const [liveOrder, setLiveOrder] = useState(order);
  const status = liveOrder.status || "Received";
  const activeIdx = getActiveIndex(status);
  const fillPct = Math.min((activeIdx / (STEPS.length - 1)) * 100, 100);
  const statusColor = getStatusColor(status);

  const [userRating, setUserRating] = useState(liveOrder.rating || 0);
  const [reviewText, setReviewText] = useState(liveOrder.review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);

  // Poll for live coordinates when order is active
  useEffect(() => {
    let interval = null;
    const fetchLatest = async () => {
      try {
        const data = await OrderService.getOrderById(order.id);
        if (data && data.id) {
          setLiveOrder(data);
        }
      } catch (e) {
        console.error("Error polling order update:", e);
      }
    };

    fetchLatest();

    if (["Out for Delivery", "Preparing", "Received", "Ready for Pickup"].includes(status)) {
      interval = setInterval(fetchLatest, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [order.id, status]);

  // Haversine distance in km (used for live ETA display)
  const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const destInfo = !isPickup ? getDestinationCoords(liveOrder) : null;
  const riderLat = liveOrder.riderLatitude ? parseFloat(liveOrder.riderLatitude) : CANTEEN_COORDS.lat;
  const riderLng = liveOrder.riderLongitude ? parseFloat(liveOrder.riderLongitude) : CANTEEN_COORDS.lng;
  const distKm = destInfo ? haversineKm(riderLat, riderLng, destInfo.lat, destInfo.lng) : 0;
  const etaMin = Math.max(1, Math.ceil((distKm / 25) * 60));

  // Load Leaflet Script / CSS or wait for window.L
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.L) {
        setLeafletLoaded(true);
        clearInterval(checkInterval);
      }
    }, 200);

    return () => clearInterval(checkInterval);
  }, []);

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

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || isPickup || !["Preparing", "Out for Delivery", "Completed"].includes(status)) {
      return;
    }

    const L = window.L;
    const canteenCoords = [CANTEEN_COORDS.lat, CANTEEN_COORDS.lng];
    const dest = getDestinationCoords(liveOrder);
    const destCoords = [dest.lat, dest.lng];

    const currentRiderLat = liveOrder.riderLatitude ? parseFloat(liveOrder.riderLatitude) : CANTEEN_COORDS.lat;
    const currentRiderLng = liveOrder.riderLongitude ? parseFloat(liveOrder.riderLongitude) : CANTEEN_COORDS.lng;
    const riderCoords = [currentRiderLat, currentRiderLng];

    // Initialize Map if not created yet
    if (!mapRef.current) {
      const mapElement = document.getElementById("leaflet-map");
      if (!mapElement) return;

      // Clean up previous instance on element if any
      if (mapElement._leaflet_id) {
        mapElement._leaflet_id = null;
      }

      const map = L.map("leaflet-map", {
        zoomControl: true,
        attributionControl: false
      }).setView(canteenCoords, 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      // Add Canteen Marker
      L.marker(canteenCoords, {
        icon: L.divIcon({
          className: "leaflet-custom-marker-canteen",
          html: `<div style="background: var(--gold); border: 2px solid #fff; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.2)">🍳</div>`,
          iconSize: [24, 24]
        })
      }).bindPopup(`<b>${liveOrder.outlet?.name || "Canteen"}</b>`).addTo(map);

      // Add Destination Marker
      L.marker(destCoords, {
        icon: L.divIcon({
          className: "leaflet-custom-marker-dest",
          html: `<div style="background: var(--green-text); border: 2px solid #fff; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.2)">📍</div>`,
          iconSize: [24, 24]
        })
      }).bindPopup(`<b>${dest.label}</b>`).addTo(map);

      // Draw Polyline route
      L.polyline([canteenCoords, destCoords], {
        color: "var(--primary)",
        weight: 3,
        dashArray: "5, 5",
        opacity: 0.6
      }).addTo(map);

      // Add Rider Marker
      const riderMarker = L.marker(riderCoords, {
        icon: L.divIcon({
          className: "leaflet-custom-marker-rider",
          html: `<div style="background: #2563eb; border: 2px solid #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.3)">🚴</div>`,
          iconSize: [28, 28]
        })
      }).bindPopup(`<b>Rider Live Position</b>`).addTo(map);

      riderMarkerRef.current = riderMarker;
      mapRef.current = map;

      // Fit bounds to show entire route
      const bounds = L.latLngBounds([canteenCoords, destCoords]);
      map.fitBounds(bounds, { padding: [30, 30] });

      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 150);
    } else {
      // Map already initialized, just update Rider Position marker!
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng(riderCoords);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        riderMarkerRef.current = null;
      }
    };
  }, [leafletLoaded, liveOrder.riderLatitude, liveOrder.riderLongitude, status]);

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
              {isPickup ? "Campus Pickup" : `Delivery → ${liveOrder.formattedAddress || liveOrder.faculty || "Campus"}`}
            </p>
          </div>
          <Badge color={statusColor}>{status}</Badge>
        </div>

        {/* Scrollable body */}
        <div className="tracker-body">

          {/* Live GPS Campus Tracker Map (delivery orders in active/complete state) */}
          {liveOrder.type === "delivery" && ["Preparing", "Out for Delivery", "Completed"].includes(status) && (
            <div className="tracker-summary-card" style={{ marginBottom: 20, padding: 16, background: "#f8fafc", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: ".8rem", fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                <i className="bi bi-geo-alt-fill" style={{ marginRight: 6, color: "var(--red-text)" }} />
                Live Campus GPS Map
                {status !== "Completed" && (
                  <span style={{ marginLeft: 10, background: "rgba(37,99,235,0.08)", color: "var(--primary)", fontSize: ".7rem", fontWeight: 800, padding: "2px 7px", borderRadius: 6 }}>
                    <i className="bi bi-broadcast" style={{ marginRight: 3 }} />
                    Updating every 4s
                  </span>
                )}
              </div>

              {/* Distance / ETA strip */}
              {status !== "Completed" && (
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{ background: "rgba(15,81,50,0.07)", border: "1px solid rgba(15,81,50,0.15)", borderRadius: 8, padding: "6px 12px", fontSize: ".78rem", fontWeight: 800, color: "var(--text-dark)" }}>
                    <i className="bi bi-arrows-angle-expand" style={{ marginRight: 5, color: "var(--primary)" }} />
                    {distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(2)} km`} away
                  </div>
                  <div style={{ background: "rgba(15,81,50,0.07)", border: "1px solid rgba(15,81,50,0.15)", borderRadius: 8, padding: "6px 12px", fontSize: ".78rem", fontWeight: 800, color: "var(--text-dark)" }}>
                    <i className="bi bi-clock" style={{ marginRight: 5, color: "var(--primary)" }} />
                    ETA ~{etaMin} min
                  </div>
                </div>
              )}

              <div style={{ position: "relative", width: "100%", height: 220, borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", zIndex: 1 }}>
                <div id="leaflet-map" style={{ width: "100%", height: "100%" }} />

                {/* Info strip overlay */}
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: 6, fontSize: ".72rem", border: "1px solid var(--border)", fontWeight: 700, color: "var(--text-dark)", zIndex: 1000 }}>
                  {liveOrder.deliveryProgress === 100 || status === "Completed" ? (
                    <span style={{ color: "var(--green-text)" }}><i className="bi bi-check-circle-fill" /> Arrived!</span>
                  ) : (
                    <span><i className="bi bi-bicycle" style={{ marginRight: 4 }} /> Rider is {100 - (liveOrder.deliveryProgress || 0)}% away...</span>
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
                <div className="tracker-info-value">{liveOrder.outlet?.name || "—"}</div>
              </div>
              <div className="tracker-info-item">
                <div className="tracker-info-title">
                  <i className={`bi ${isPickup ? "bi-bag-check" : "bi-truck"}`} style={{ marginRight: 5 }} />
                  {isPickup ? "Pickup" : "Delivery Location"}
                </div>
                <div className="tracker-info-value">
                  {isPickup ? "Canteen Counter" : (liveOrder.formattedAddress || liveOrder.faculty || "—")}
                </div>
              </div>
              <div className="tracker-info-item">
                <div className="tracker-info-title">
                  <i className="bi bi-calendar2-check" style={{ marginRight: 5 }} />
                  Ordered
                </div>
                <div className="tracker-info-value">{liveOrder.time || "—"}</div>
              </div>
            </div>

            {/* Delivery Notes */}
            {!isPickup && liveOrder.deliveryNotes && (
              <div style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.25)", padding: "8px 12px", borderRadius: 8, marginTop: 10, fontSize: ".82rem", color: "var(--text-dark)" }}>
                <i className="bi bi-pencil-square" style={{ color: "var(--gold)", marginRight: 6 }} />
                <strong>Your delivery note:</strong> {liveOrder.deliveryNotes}
              </div>
            )}
          </div>

          {/* Rider Info Card (Only if delivery and rider is assigned) */}
          {!isPickup && liveOrder.assignedRiderName && (
            <div className="tracker-info-card" style={{ marginTop: 14, background: "rgba(37, 99, 235, 0.04)", border: "1px solid rgba(37, 99, 235, 0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyCon: "center", color: "#fff", fontSize: "1.2rem" }}>
                  <i className="bi bi-person-badge-fill" />
                </div>
                <div>
                  <div style={{ fontSize: ".76rem", color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Delivery Rider Assigned</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-dark)" }}>{liveOrder.assignedRiderName}</div>
                  <div style={{ fontSize: ".82rem", color: "var(--text-muted)", marginTop: 2 }}>
                    <i className="bi bi-telephone-fill" style={{ marginRight: 6, color: "var(--primary)" }} />
                    <a href={`tel:${liveOrder.assignedRiderPhone}`} style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}>
                      {liveOrder.assignedRiderPhone}
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
              {liveOrder.items.map((item, idx) => (
                <div key={item.id || idx} className="tracker-summary-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border)" }}
                      />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-page)", display: "flex", alignItems: "center", justifyCon: "center", fontSize: "1.3rem", border: "1px solid var(--border)" }}>
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
                ₦{liveOrder.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Rating and Review Card (only when status is Completed) */}
          {status === "Completed" && (
            <div className="tracker-summary-card" style={{ marginTop: 20, padding: 18, background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <div style={{ fontSize: ".88rem", fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <i className="bi bi-star-fill" style={{ color: "var(--gold)" }} />
                {(liveOrder.rating > 0 || successMsg) ? "Your Rating & Review" : "Rate Your Meal & Service"}
              </div>

              {(liveOrder.rating > 0 || successMsg) ? (
                <div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8, fontSize: "1.1rem" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <i
                        key={star}
                        className={`bi ${star <= (liveOrder.rating || userRating) ? "bi-star-fill" : "bi-star"}`}
                        style={{ color: "var(--gold)" }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: ".86rem", color: "var(--text-dark)", margin: 0, fontStyle: "italic" }}>
                    "{liveOrder.review || reviewText || "No comment left."}"
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
