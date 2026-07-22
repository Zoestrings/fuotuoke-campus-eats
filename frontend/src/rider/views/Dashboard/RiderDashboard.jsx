import React, { useState, useEffect } from "react";
import { OrderService } from "../../services/OrderService";
import { AuthService } from "../../services/AuthService";
import { Badge, Btn } from "../../../shared/ui";
import { CANTEEN_COORDS, getCoordsForLabel } from "../../../CampusLocations";

// ── Inline distance & ETA helpers ────────────────────────────
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const etaLabel = (km) => `~${Math.max(2, Math.ceil((km / 25) * 60) + 3)} min`;
const fmtDist = (km) => km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;

export default function RiderDashboard({ onLogoutSuccess }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [riderPhone, setRiderPhone] = useState(
    localStorage.getItem("fuo_rider_phone") || ""
  );
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const user = AuthService.getSession() || { name: "Delivery Rider", userId: "" };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await OrderService.getRiderOrders();
      const deliveryOrders = (data || []).filter(o => o.type === "delivery");
      setOrders(deliveryOrders);
    } catch (err) {
      console.error(err);
      setError("Failed to load delivery orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 10 seconds for new available delivery orders
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    onLogoutSuccess();
  };

  const handleOpenAcceptModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowPhoneModal(true);
  };

  const handleAcceptDelivery = async () => {
    if (!riderPhone.trim() || riderPhone.length < 11) {
      alert("Please enter a valid 11-digit phone number so the customer can reach you.");
      return;
    }
    localStorage.setItem("fuo_rider_phone", riderPhone);
    setShowPhoneModal(false);

    try {
      await OrderService.acceptDelivery(selectedOrderId, riderPhone);
      fetchOrders();
      setActiveTab("active");
    } catch (err) {
      alert(err.message || "Could not accept delivery.");
    }
  };

  const handleCompleteDelivery = async (orderId) => {
    if (!window.confirm("Are you sure you have delivered this food to the customer?")) {
      return;
    }
    try {
      await OrderService.completeDelivery(orderId);
      fetchOrders();
      setActiveTab("completed");
    } catch (err) {
      alert(err.message || "Failed to complete delivery.");
    }
  };

  const [runningSimulations, setRunningSimulations] = useState({});
  const [activeWatchers, setActiveWatchers] = useState({});

  // Destination coordinates from campus locations registry
  const getDestinationCoords = (order) => {
    // 1. Try saved GPS coordinates from the order
    if (order.latitude && order.longitude) {
      return { lat: parseFloat(order.latitude), lng: parseFloat(order.longitude) };
    }
    // 2. Look up by formattedAddress (campus location name)
    if (order.formattedAddress) {
      return getCoordsForLabel(order.formattedAddress);
    }
    // 3. Fallback: old faculty keyword lookup
    if (order.faculty) {
      return getCoordsForLabel(order.faculty);
    }
    return CANTEEN_COORDS;
  };

  const handleStartSimulation = (orderId, order) => {
    if (runningSimulations[orderId]) return;

    // Stop live tracking if active to avoid collision
    stopLiveTracking(orderId);

    const start = CANTEEN_COORDS;
    const dest = getDestinationCoords(order);

    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += 10;
      const t = currentProgress / 100;
      const currentLat = start.lat + (dest.lat - start.lat) * t;
      const currentLng = start.lng + (dest.lng - start.lng) * t;

      if (currentProgress >= 100) {
        clearInterval(interval);
        setRunningSimulations(prev => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        try {
          await OrderService.updateRiderLocation(orderId, dest.lat, dest.lng);
          await OrderService.completeDelivery(orderId);
          fetchOrders();
          setActiveTab("completed");
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          await OrderService.updateRiderLocation(orderId, currentLat, currentLng);
          await OrderService.updateDeliveryProgress(orderId, currentProgress);
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryProgress: currentProgress, riderLatitude: currentLat, riderLongitude: currentLng } : o));
        } catch (e) {
          console.error(e);
        }
      }
    }, 2000);

    setRunningSimulations(prev => ({ ...prev, [orderId]: interval }));
  };

  const startLiveTracking = (orderId) => {
    if (activeWatchers[orderId]) return;

    // Stop simulation if running to avoid conflicts
    if (runningSimulations[orderId]) {
      clearInterval(runningSimulations[orderId]);
      setRunningSimulations(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    const watchOptions = { enableHighAccuracy: false, maximumAge: 5000, timeout: 15000 };

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await OrderService.updateRiderLocation(orderId, latitude, longitude);
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, riderLatitude: latitude, riderLongitude: longitude } : o));
        } catch (e) {
          console.error("Error updating location:", e);
        }
      },
      (error) => {
        console.warn("Rider geolocation warning:", error.message || error);
      },
      watchOptions
    );

    setActiveWatchers(prev => ({ ...prev, [orderId]: watchId }));
  };

  const stopLiveTracking = (orderId) => {
    if (activeWatchers[orderId]) {
      navigator.geolocation.clearWatch(activeWatchers[orderId]);
      setActiveWatchers(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }
  };

  useEffect(() => {
    return () => {
      Object.values(runningSimulations).forEach(clearInterval);
      Object.values(activeWatchers).forEach(navigator.geolocation.clearWatch);
    };
  }, [runningSimulations, activeWatchers]);

  // Filter lists
  const availableOrders = orders.filter(
    o => o.type === "delivery" && ["Preparing", "Ready"].includes(o.status) && !o.assignedRiderId
  );
  const activeDeliveries = orders.filter(
    o => (o.assignedRiderId === user.userId || o.assignedRiderId === user.id) && o.status !== "Completed" && o.status !== "Cancelled"
  );
  const completedDeliveries = orders.filter(
    o => (o.assignedRiderId === user.userId || o.assignedRiderId === user.id) && o.status === "Completed"
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)", paddingBottom: 60 }}>
      {/* ── Top Navigation Bar ─────────────────────────── */}
      <nav className="navbar" style={{ background: "var(--primary)" }}>
        <div className="nav-brand">
          <img src="/FUO_Logo.png" alt="Logo" className="nav-brand-img" style={{ width: 34, height: 34, objectFit: "contain" }} />
          <div>
            <div className="nav-brand-title" style={{ color: "#fff" }}>FUOTUOKE Campus Eats</div>
            <div className="nav-brand-subtitle" style={{ color: "rgba(255,255,255,0.7)" }}>Rider Delivery Control</div>
          </div>
        </div>

        <div className="nav-links">
          <div className="nav-user-info">
            <i className="bi bi-bicycle" style={{ fontSize: "1rem", color: "#fff", opacity: 0.9 }} />
            <span className="nav-user-name" style={{ color: "#fff" }}>{user.name}</span>
            <span className="nav-user-role-badge" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>Rider</span>
          </div>

          <div style={{ position: "relative" }}>
            <button className="nav-btn" onClick={() => setShowLogoutConfirm(!showLogoutConfirm)} style={{ gap: 6, color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
              <i className="bi bi-box-arrow-right" style={{ fontSize: "1rem" }} /> Logout
            </button>
            {showLogoutConfirm && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,.22)", zIndex: 1000, minWidth: 230, overflow: "hidden", border: "1px solid var(--border)" }}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                  <p style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--text-dark)", margin: 0 }}>Sign out?</p>
                  <p style={{ fontSize: ".78rem", color: "var(--text-light)", margin: "4px 0 0" }}>Sign out of the rider dashboard.</p>
                </div>
                <div style={{ display: "flex", gap: 8, padding: "12px 14px" }}>
                  <button onClick={() => setShowLogoutConfirm(false)} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ flex: 1, background: "var(--red-text)", color: "#fff" }}>
                    <i className="bi bi-box-arrow-right" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger menu */}
        <button
          className="nav-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          style={{ color: "#fff", background: "transparent", border: "none", fontSize: "1.6rem", cursor: "pointer" }}
        >
          <i className="bi bi-list" />
        </button>
      </nav>

      {/* ── Mobile Nav Drawer ──────────────────────────── */}
      <div
        className={`nav-drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`nav-drawer staff${drawerOpen ? " open" : ""}`}
        aria-label="Rider navigation menu"
      >
        {/* Header */}
        <div className="nav-drawer-header" style={{ background: "var(--primary)" }}>
          <div className="nav-drawer-brand">
            <img src="/FUO_Logo.png" alt="Logo" />
            <span className="nav-drawer-brand-title" style={{ color: "#fff" }}>Rider Hub</span>
          </div>
          <button className="nav-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ color: "#fff" }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* User info */}
        <div className="nav-drawer-user">
          <div className="nav-drawer-user-avatar" style={{ color: "var(--primary)" }}>
            <i className="bi bi-bicycle" />
          </div>
          <div>
            <div className="nav-drawer-user-name">{user.name}</div>
            <div className="nav-drawer-user-role">Delivery Personnel</div>
          </div>
        </div>

        {/* Navigation links inside drawer */}
        <div className="nav-drawer-links">
          <button
            className={`nav-drawer-item${activeTab === "available" ? " active staff" : ""}`}
            onClick={() => { setActiveTab("available"); setDrawerOpen(false); }}
            style={{ borderLeftColor: activeTab === "available" ? "var(--primary)" : "transparent" }}
          >
            <i className="bi bi-bicycle" style={{ marginRight: 8 }} />
            Available Runs ({availableOrders.length})
          </button>
          <button
            className={`nav-drawer-item${activeTab === "active" ? " active staff" : ""}`}
            onClick={() => { setActiveTab("active"); setDrawerOpen(false); }}
            style={{ borderLeftColor: activeTab === "active" ? "var(--primary)" : "transparent" }}
          >
            <i className="bi bi-lightning-fill" style={{ marginRight: 8 }} />
            Active Runs ({activeDeliveries.length})
          </button>
          <button
            className={`nav-drawer-item${activeTab === "completed" ? " active staff" : ""}`}
            onClick={() => { setActiveTab("completed"); setDrawerOpen(false); }}
            style={{ borderLeftColor: activeTab === "completed" ? "var(--primary)" : "transparent" }}
          >
            <i className="bi bi-check-circle" style={{ marginRight: 8 }} />
            History ({completedDeliveries.length})
          </button>
        </div>

        {/* Sign out */}
        <div className="nav-drawer-footer">
          <button className="nav-drawer-logout" onClick={() => { setDrawerOpen(false); handleLogout(); }} style={{ color: "var(--red-text)" }}>
            <i className="bi bi-box-arrow-right" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Container ─────────────────────────────── */}
      <div className="container" style={{ maxWidth: 840, padding: "24px 16px" }}>
        
        {/* Analytics Card Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div className="analytics-card" style={{ background: "#fff", padding: 20, borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: ".84rem", color: "var(--text-light)", fontWeight: 700 }}>Available Deliveries</span>
              <i className="bi bi-bicycle" style={{ color: "var(--primary)", fontSize: "1.2rem" }} />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-dark)", marginTop: 8 }}>
              {availableOrders.length}
            </div>
            <div style={{ fontSize: ".76rem", color: "var(--text-muted)", marginTop: 4 }}>Needs dispatcher</div>
          </div>
          <div className="analytics-card" style={{ background: "#fff", padding: 20, borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: ".84rem", color: "var(--text-light)", fontWeight: 700 }}>Your Active Runs</span>
              <i className="bi bi-lightning-fill" style={{ color: "var(--gold)", fontSize: "1.2rem" }} />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-dark)", marginTop: 8 }}>
              {activeDeliveries.length}
            </div>
            <div style={{ fontSize: ".76rem", color: "var(--text-muted)", marginTop: 4 }}>On the way</div>
          </div>
          <div className="analytics-card" style={{ background: "#fff", padding: 20, borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: ".84rem", color: "var(--text-light)", fontWeight: 700 }}>Completed Runs</span>
              <i className="bi bi-check2-all" style={{ color: "var(--green-text)", fontSize: "1.2rem" }} />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-dark)", marginTop: 8 }}>
              {completedDeliveries.length}
            </div>
            <div style={{ fontSize: ".76rem", color: "var(--text-muted)", marginTop: 4 }}>Success deliveries</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", gap: 8, background: "rgba(0,0,0,0.03)", padding: 6, borderRadius: 10, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab("available")}
            className={`btn ${activeTab === "available" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1, padding: "10px", fontSize: ".86rem" }}
          >
            <i className="bi bi-inbox" style={{ marginRight: 6 }} /> Available ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`btn ${activeTab === "active" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1, padding: "10px", fontSize: ".86rem" }}
          >
            <i className="bi bi-truck animate-pulse" style={{ marginRight: 6 }} /> Active ({activeDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`btn ${activeTab === "completed" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1, padding: "10px", fontSize: ".86rem" }}
          >
            <i className="bi bi-check2-circle" style={{ marginRight: 6 }} /> History ({completedDeliveries.length})
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
            <span style={{ color: "var(--text-light)", fontSize: ".9rem" }}>Fetching latest deliveries...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--red-text)" }}>
            <i className="bi bi-exclamation-triangle" style={{ fontSize: "2rem" }} />
            <p>{error}</p>
            <button className="btn btn-outline btn-sm" onClick={fetchOrders} style={{ marginTop: 10 }}>Retry</button>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            
            {/* AVAILABLE DELIVERIES LIST */}
            {activeTab === "available" && (
              availableOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <i className="bi bi-bicycle" style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: 12, display: "block" }} />
                  <p style={{ fontWeight: 700, color: "var(--text-dark)" }}>No available food deliveries</p>
                  <p style={{ color: "var(--text-light)", fontSize: ".86rem" }}>Orders show up here when canteens start preparing food.</p>
                </div>
              ) : (
                availableOrders.map(order => {
                  const destCoords = getDestinationCoords(order);
                  const distKm = haversineKm(CANTEEN_COORDS.lat, CANTEEN_COORDS.lng, destCoords.lat, destCoords.lng);
                  const locationLabel = order.formattedAddress || order.faculty || "Campus Location";
                  return (
                    <div key={order.id} className="order-card" style={{ background: "#fff", padding: 18, borderRadius: 14, border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-dark)" }}>Order #{String(order.id).slice(-5)}</div>
                          <div style={{ fontSize: ".82rem", color: "var(--text-light)" }}>Canteen: <strong>{order.outlet.name}</strong></div>
                        </div>
                        <Badge color="gold">{order.status}</Badge>
                      </div>

                      {/* Destination info */}
                      <div style={{ background: "rgba(15,81,50,0.05)", border: "1px solid rgba(15,81,50,0.12)", padding: "10px 12px", borderRadius: 9, marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <i className="bi bi-geo-alt-fill" style={{ color: "var(--primary)", fontSize: ".9rem" }} />
                          <span style={{ fontWeight: 800, fontSize: ".86rem", color: "var(--text-dark)" }}>{locationLabel}</span>
                        </div>
                        <div style={{ display: "flex", gap: 10, fontSize: ".74rem", color: "var(--text-muted)", fontWeight: 700 }}>
                          <span><i className="bi bi-arrows-angle-expand" style={{ marginRight: 3 }} />{fmtDist(distKm)}</span>
                          <span><i className="bi bi-clock" style={{ marginRight: 3 }} />{etaLabel(distKm)} ETA</span>
                          {order.latitude && <span style={{ opacity: 0.7 }}><i className="bi bi-crosshair" style={{ marginRight: 3 }} />{parseFloat(order.latitude).toFixed(4)}, {parseFloat(order.longitude).toFixed(4)}</span>}
                        </div>
                      </div>

                      {/* Delivery notes */}
                      {order.deliveryNotes && (
                        <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontSize: ".8rem", color: "var(--text-dark)" }}>
                          <i className="bi bi-pencil-square" style={{ marginRight: 5, color: "var(--gold)" }} />
                          <strong>Note:</strong> {order.deliveryNotes}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: ".86rem", color: "var(--text-light)" }}>
                          Items: {order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}
                        </span>
                        <Btn sm variant="primary" onClick={() => handleOpenAcceptModal(order.id)}>
                          <i className="bi bi-bicycle" /> Claim Delivery
                        </Btn>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {/* ACTIVE DELIVERIES LIST */}
            {activeTab === "active" && (
              activeDeliveries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <i className="bi bi-clock" style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: 12, display: "block" }} />
                  <p style={{ fontWeight: 700, color: "var(--text-dark)" }}>No active runs</p>
                  <p style={{ color: "var(--text-light)", fontSize: ".86rem" }}>Claim orders in the "Available" tab to start delivering!</p>
                </div>
              ) : (
                activeDeliveries.map(order => {
                  const destCoords = getDestinationCoords(order);
                  const distKm = haversineKm(CANTEEN_COORDS.lat, CANTEEN_COORDS.lng, destCoords.lat, destCoords.lng);
                  const locationLabel = order.formattedAddress || order.faculty || "Campus Location";
                  return (
                  <div key={order.id} className="order-card" style={{ background: "#fff", padding: 18, borderRadius: 14, border: "1px solid var(--border)", borderLeft: "4px solid var(--gold)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-dark)" }}>Order #{String(order.id).slice(-5)}</div>
                        <div style={{ fontSize: ".82rem", color: "var(--text-light)" }}>Canteen: <strong>{order.outlet.name}</strong></div>
                      </div>
                      <Badge color="blue">{order.status}</Badge>
                    </div>

                    {/* Delivery destination details */}
                    <div style={{ background: "rgba(15,81,50,0.05)", border: "1px solid rgba(15,81,50,0.15)", borderRadius: 10, padding: "12px 14px", margin: "10px 0 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <i className="bi bi-geo-alt-fill" style={{ color: "var(--primary)", fontSize: "1rem" }} />
                        <span style={{ fontWeight: 800, fontSize: ".88rem", color: "var(--text-dark)" }}>{locationLabel}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: ".74rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: order.latitude ? 6 : 0 }}>
                        <span><i className="bi bi-arrows-angle-expand" style={{ marginRight: 3 }} />{fmtDist(distKm)} away</span>
                        <span><i className="bi bi-clock" style={{ marginRight: 3 }} />ETA: {etaLabel(distKm)}</span>
                        <span><i className="bi bi-person-fill" style={{ marginRight: 3 }} />{order.customerName}</span>
                      </div>
                      {order.latitude && (
                        <div style={{ fontSize: ".71rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                          <i className="bi bi-crosshair" style={{ marginRight: 4 }} />
                          {parseFloat(order.latitude).toFixed(5)}, {parseFloat(order.longitude).toFixed(5)}
                        </div>
                      )}
                    </div>

                    {/* Delivery notes callout */}
                    {order.deliveryNotes && (
                      <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)", padding: "9px 12px", borderRadius: 8, marginBottom: 12, fontSize: ".8rem" }}>
                        <i className="bi bi-pencil-square" style={{ color: "var(--gold)", marginRight: 5 }} />
                        <strong>Rider Note:</strong> {order.deliveryNotes}
                      </div>
                    )}
                    {/* GPS Progress simulation row */}
                    {(order.deliveryProgress > 0 || runningSimulations[order.id]) ? (
                      <div style={{ background: "rgba(37, 99, 235, 0.05)", border: "1px solid rgba(37, 99, 235, 0.15)", padding: 12, borderRadius: 10, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", color: "var(--primary)", fontWeight: 700, marginBottom: 6 }}>
                          <span><i className="bi bi-bicycle" style={{ marginRight: 6 }} /> GPS Delivery Simulation Running</span>
                          <span>{order.deliveryProgress || 0}%</span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${order.deliveryProgress || 0}%`, height: "100%", background: "var(--primary)", borderRadius: 3, transition: "width 0.4s ease" }} />
                        </div>
                        <span style={{ fontSize: ".74rem", color: "var(--text-light)", marginTop: 6, display: "block" }}>
                          Updating live coordinates to client map...
                        </span>
                      </div>
                    ) : null}

                     {/* GPS Active/Stream Mode indicators */}
                    {activeWatchers[order.id] && (
                      <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: 12, borderRadius: 10, marginBottom: 14, fontSize: ".8rem", color: "var(--green-text)", fontWeight: 700 }}>
                        <i className="bi bi-broadcast-pin" style={{ marginRight: 6 }} /> 
                        Streaming live device GPS coordinates to customer...
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--border)", paddingTop: 12, marginTop: 4 }}>
                      <span style={{ fontSize: ".84rem", color: "var(--text-light)" }}>
                        Items: {order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}
                      </span>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {activeWatchers[order.id] ? (
                          <Btn sm variant="danger" onClick={() => stopLiveTracking(order.id)}>
                            <i className="bi bi-stop-circle" /> Stop GPS Stream
                          </Btn>
                        ) : (
                          <Btn sm variant="outline" onClick={() => startLiveTracking(order.id)}>
                            <i className="bi bi-broadcast" /> Stream GPS
                          </Btn>
                        )}

                        {!(order.deliveryProgress > 0 || runningSimulations[order.id]) && (
                          <Btn sm variant="primary" onClick={() => handleStartSimulation(order.id, order)}>
                            <i className="bi bi-play-circle" /> Simulate GPS
                          </Btn>
                        )}
                        <Btn sm variant="green" onClick={() => handleCompleteDelivery(order.id)}>
                          <i className="bi bi-check-circle" /> Complete
                        </Btn>
                      </div>
                    </div>
                  </div>
                  );
                })
              )
            )}

            {/* COMPLETED DELIVERIES LIST */}
            {activeTab === "completed" && (
              completedDeliveries.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <i className="bi bi-journal-check" style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: 12, display: "block" }} />
                  <p style={{ fontWeight: 700, color: "var(--text-dark)" }}>No completed deliveries yet</p>
                  <p style={{ color: "var(--text-light)", fontSize: ".86rem" }}>Deliveries you fulfill will be saved here in history.</p>
                </div>
              ) : (
                completedDeliveries.map(order => (
                  <div key={order.id} className="order-card" style={{ background: "#fff", padding: 18, borderRadius: 14, border: "1px solid var(--border)", opacity: 0.85 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.94rem", color: "var(--text-dark)" }}>Order #{String(order.id).slice(-5)}</div>
                        <div style={{ fontSize: ".82rem", color: "var(--text-light)" }}>To: {order.customerName} ({order.faculty})</div>
                      </div>
                      <Badge color="green">Delivered</Badge>
                    </div>
                  </div>
                ))
              )
            )}

          </div>
        )}
      </div>

      {/* ── Contact Phone Modal ────────────────────────── */}
      {showPhoneModal && (
        <div className="modal-backdrop" style={{ zIndex: 5000 }}>
          <div className="modal-content animate-fade-up" style={{ maxWidth: 360, padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>Enter Contact Number</h3>
            <p style={{ fontSize: ".84rem", color: "var(--text-light)", marginBottom: 16 }}>
              Provide your phone number so the student can contact you regarding the delivery.
            </p>
            <input
              type="text"
              placeholder="e.g. 08012345678"
              value={riderPhone}
              onChange={e => setRiderPhone(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 16, fontSize: ".9rem", fontWeight: 600 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowPhoneModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAcceptDelivery}>Accept</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
