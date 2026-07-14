import React from "react";
import { Badge, Btn } from "../../../shared/ui";
import { CANTEEN_COORDS, getCoordsForLabel } from "../../../CampusLocations";

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const etaLabel = (km) => `~${Math.max(2, Math.ceil((km / 25) * 60) + 3)} min`;

export default function OrdersManagement({ orders = [], outletName, onAdvanceStatus, isCompletedView = false }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "52px 24px", background: "var(--bg-main)", borderRadius: 14, border: "1px solid var(--border)" }}>
        <i
          className={`bi ${isCompletedView ? "bi-graph-up-arrow" : "bi-check-circle"}`}
          style={{ fontSize: "3rem", color: isCompletedView ? "var(--text-muted)" : "var(--green-text)", marginBottom: 12, display: "block" }}
        />
        <p style={{ fontWeight: 700, color: "var(--text-dark)", marginBottom: 4 }}>
          {isCompletedView ? "No completed orders yet" : "All clear!"}
        </p>
        <p style={{ color: "var(--text-light)", fontSize: ".86rem" }}>
          {isCompletedView ? "Advance active orders to mark them complete" : `No active orders for ${outletName}`}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-fade-in">
      {orders.map(order => {
        const status = order.status || "Received";

        let btnIcon = "bi-fire";
        let btnLabel = "Start Preparing";
        if (status === "Preparing") {
          btnIcon = order.type === "pickup" ? "bi-bag-check" : "bi-truck";
          btnLabel = order.type === "pickup" ? "Ready for Pickup" : "Dispatch Delivery";
        } else if (status === "Ready for Pickup" || status === "Out for Delivery") {
          btnIcon = "bi-check-circle-fill";
          btnLabel = "Complete Order";
        }

        return (
          <div key={order.id} className="order-card" style={isCompletedView ? { opacity: 0.85 } : {}}>
            <div className="order-card-header">
              <div>
                <div className="order-card-id">Order #{String(order.id).slice(-5)}</div>
                <div className="order-card-meta">
                  <i className={`bi ${order.type === "pickup" ? "bi-bag-check" : "bi-truck"}`} style={{ marginRight: 4 }} />
                  {isCompletedView
                    ? `Completed · ${order.time}`
                    : (order.type === "pickup" ? "Pickup" : (
                        (() => {
                          const label = order.formattedAddress || order.faculty || "Campus";
                          const dest = order.latitude && order.longitude
                            ? { lat: parseFloat(order.latitude), lng: parseFloat(order.longitude) }
                            : getCoordsForLabel(label);
                          const km = haversineKm(CANTEEN_COORDS.lat, CANTEEN_COORDS.lng, dest.lat, dest.lng);
                          return `Delivery to ${label} · ${etaLabel(km)}`;
                        })()
                      ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isCompletedView ? (
                  <Badge color="green">
                    <i className="bi bi-check-lg" style={{ marginRight: 4 }} /> Completed
                  </Badge>
                ) : (
                  <>
                    <Badge color={status === "Received" ? "blue" : "gold"}>{status}</Badge>
                    <Btn sm variant="gold" onClick={() => onAdvanceStatus(order.id, status, order.type)}>
                      <i className={`bi ${btnIcon}`} /> {btnLabel}
                    </Btn>
                  </>
                )}
              </div>
            </div>

            {/* Delivery notes */}
            {order.type === "delivery" && order.deliveryNotes && (
              <div style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.25)", padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontSize: ".8rem", color: "var(--text-dark)" }}>
                <i className="bi bi-pencil-square" style={{ color: "var(--gold)", marginRight: 5 }} />
                <strong>Note:</strong> {order.deliveryNotes}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {order.items.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", color: "var(--text-dark)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: 20, height: 20, borderRadius: 4, objectFit: "cover" }} />
                    ) : (
                      <span>{item.emoji}</span>
                    )}
                    <span><strong>{item.name}</strong> × {item.qty}</span>
                  </span>
                  <span style={{ color: "var(--text-light)" }}>₦{item.price.toLocaleString()} each</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border)", paddingTop: 10, marginTop: 10, fontWeight: 800, fontSize: ".9rem" }}>
              <span style={{ color: "var(--text-dark)" }}>Order Value</span>
              <span style={{ color: "var(--green-text)" }}>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
