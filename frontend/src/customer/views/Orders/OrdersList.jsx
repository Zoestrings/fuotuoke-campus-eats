import React from "react";
import { Btn, Badge } from "../../../shared/ui";

export default function OrdersList({ isStaff, accent, orders, setPage, onTrackOrder }) {
  return (
    <div className="page-bg animate-fade-in">
      <div className="orders-page-root">

        <h2 className="page-heading">
          <i className="bi bi-receipt" style={{ color: accent }} />
          My Orders
        </h2>

        {orders.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No orders placed yet</p>
            <p style={{ fontSize: ".82rem", color: "var(--text-light)", marginBottom: 20 }}>
              Head over to the menu to browse and order delicious campus meals.
            </p>
            <Btn variant={isStaff ? "gold" : "primary"} onClick={() => setPage("menu")}>
              <i className="bi bi-grid" /> Browse Menu
            </Btn>
          </div>
        ) : (
          <div>
            {orders.map(order => {
              const status = order.status || "Received";
              const statusColor =
                status === "Completed" ? "green"
                  : status === "Cancelled" ? "red"
                    : status === "Received" ? "blue"
                      : "gold";

              return (
                <div key={order.id} className="order-list-item animate-fade-up">
                  {/* Order header */}
                  <div className="order-list-header">
                    <div>
                      <div className="order-list-id">
                        Order #{String(order.id).slice(-5)}
                      </div>
                      <div className="order-list-meta">
                        <i className="bi bi-clock" style={{ marginRight: 4 }} />
                        {order.time}
                        &nbsp;·&nbsp;
                        <i className="bi bi-shop" style={{ marginRight: 4 }} />
                        {order.outlet?.name}
                        &nbsp;·&nbsp;
                        <i className={`bi ${order.type === "pickup" ? "bi-bag-check" : "bi-truck"}`} style={{ marginRight: 4 }} />
                        {order.type === "pickup" ? "Pickup" : `Delivery${order.faculty ? ` → ${order.faculty}` : ""}`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Badge color={statusColor}>{status}</Badge>
                      <Btn sm variant="outline" onClick={() => onTrackOrder(order)}>
                        <i className="bi bi-geo-alt-fill" /> Track
                      </Btn>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="order-list-items-grid">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="order-list-row">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="order-list-thumb" loading="lazy" />
                        ) : (
                          <div className="order-list-emoji-thumb">{item.emoji}</div>
                        )}
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{item.name}</span>
                          <span style={{ color: "var(--text-light)", fontSize: ".78rem" }}> × {item.qty}</span>
                        </div>
                        <span style={{ fontSize: ".84rem", fontWeight: 700, color: "var(--text-dark)" }}>
                          ₦{(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="order-list-footer">
                    <div className="order-list-total">
                      <span style={{ color: "var(--text-light)", fontWeight: 500, fontSize: ".8rem" }}>Order Total&nbsp;</span>
                      <span style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>
                        ₦{order.total.toLocaleString()}
                      </span>
                    </div>
                    {status !== "Completed" && (
                      <Btn sm variant={isStaff ? "gold" : "primary"} onClick={() => onTrackOrder(order)}>
                        <i className="bi bi-broadcast" /> Live Track
                      </Btn>
                    )}
                    {status === "Completed" && (
                      <span style={{ fontSize: ".76rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                        <i className="bi bi-check-circle-fill" style={{ color: "var(--green-text)" }} />
                        Order Complete
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
