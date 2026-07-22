import React, { useState, useEffect } from "react";
import { OUTLETS } from "../../../data";
import { Btn } from "../../../shared/ui";
import { useToast } from "../../../context/ToastContext";
import { GeocodingService } from "../../services/GeocodingService";
import { CANTEEN_COORDS } from "../../../CampusLocations";
import CampusLocationPicker from "./CampusLocationPicker";

const SectionCard = ({ children }) => (
  <div style={{
    background: "#fff",
    borderRadius: 14,
    padding: "20px 22px",
    marginBottom: 14,
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)"
  }}>
    {children}
  </div>
);

const SectionLabel = ({ icon, children }) => (
  <p style={{
    fontSize: ".73rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "var(--text-muted)",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 6
  }}>
    <i className={`bi ${icon}`} />
    {children}
  </p>
);

export default function CartView({
  isStaff, accent, cart, addItem, removeItem,
  cartCount, cartTotal, outlet, setOutlet,
  orderType, setOType, placeOrder, setPage
}) {
  const { showToast } = useToast();

  // ── Location state ───────────────────────────────────────
  const [selectedCampusLocation, setSelectedCampusLocation] = useState(null);
  const [gpsMode, setGpsMode] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [address, setAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");

  const [leafletReady, setLeafletReady] = useState(!!window.L);

  // Poll until Leaflet script is loaded
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
    const interval = setInterval(() => {
      if (window.L) {
        setLeafletReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // ── Leaflet map initialisation ───────────────────────────
  useEffect(() => {
    if (orderType !== "delivery" || !leafletReady) return;

    const L = window.L;
    if (!L) return;

    const container = document.getElementById("delivery-map");
    if (!container) return;

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const initLat = lat || CANTEEN_COORDS.lat;
    const initLng = lng || CANTEEN_COORDS.lng;

    const map = L.map("delivery-map").setView([initLat, initLng], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([initLat, initLng], { draggable: true, icon }).addTo(map);

    // Drag → reverse geocode → update address
    marker.on("dragend", async () => {
      const pos = marker.getLatLng();
      setLat(pos.lat);
      setLng(pos.lng);
      setSelectedCampusLocation(null);
      setGpsMode(true);
      setLocLoading(true);
      try {
        const resolved = await GeocodingService.reverseGeocode(pos.lat, pos.lng);
        setAddress(resolved);
      } catch {
        // silently fall back
      } finally {
        setLocLoading(false);
      }
    });

    container.mapInstance = map;
    container.markerInstance = marker;

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 150);

    return () => {
      if (container.mapInstance) {
        container.mapInstance.remove();
        delete container.mapInstance;
        delete container.markerInstance;
        delete container._leaflet_id;
      }
    };
  }, [orderType, leafletReady]);

  // ── Helper: pan map + move marker to new coords ──────────
  const updateMapView = (newLat, newLng, zoom = 17) => {
    const container = document.getElementById("delivery-map");
    if (container?.mapInstance && container?.markerInstance) {
      container.mapInstance.setView([newLat, newLng], zoom);
      container.markerInstance.setLatLng([newLat, newLng]);
    }
  };

  // ── Campus picker selection ──────────────────────────────
  const handleSelectCampusLocation = (loc) => {
    setSelectedCampusLocation(loc);
    setGpsMode(false);
    setLat(loc.lat);
    setLng(loc.lng);
    setAddress(loc.name);
    setLocError("");
    updateMapView(loc.lat, loc.lng, 17);
  };

  // ── GPS detection ────────────────────────────────────────
  const handleUseGPS = () => {
    setGpsMode(true);
    setSelectedCampusLocation(null);
    setAddress("");
    fetchCurrentLocation();
  };

  const fetchCurrentLocation = (highAccuracy = true) => {
    setLocLoading(true);
    setLocError("");

    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        updateMapView(latitude, longitude, 17);
        try {
          const resolved = await GeocodingService.reverseGeocode(latitude, longitude);
          setAddress(resolved);
        } catch {
          setLocError("Could not resolve address. Please select a campus location.");
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        // High accuracy timeout or unavailable -> fallback to standard accuracy
        if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
          fetchCurrentLocation(false);
          return;
        }
        let msg = "Could not retrieve location. Select a campus location above.";
        if (error.code === error.PERMISSION_DENIED)
          msg = "Location permission denied. Please pick a location from the list.";
        else if (error.code === error.POSITION_UNAVAILABLE)
          msg = "Your position is currently unavailable.";
        else if (error.code === error.TIMEOUT)
          msg = "GPS request timed out. Please select a location from the list.";
        setLocError(msg);
        setLocLoading(false);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 6000 : 12000,
        maximumAge: 10000
      }
    );
  };

  // ── Place order handler ──────────────────────────────────
  const handlePlaceOrder = () => {
    if (orderType === "delivery") {
      if (!address || !address.trim()) {
        showToast("Please select a campus location or allow GPS detection.", "warning");
        return;
      }
    }

    const locationName = address.trim() || "Campus Location";
    // faculty field = location name (for backward-compat with dashboards)
    placeOrder(locationName, {
      latitude: lat || CANTEEN_COORDS.lat,
      longitude: lng || CANTEEN_COORDS.lng,
      formattedAddress: locationName,
      deliveryNotes: deliveryNotes
    });
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="page-bg animate-fade-in">
      <div className="page-content-small">

        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.4rem,3vw,1.9rem)",
          fontWeight: 900,
          color: "var(--text-dark)",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <i className="bi bi-cart3" style={{ color: accent }} />
          Your Cart
        </h2>

        {/* ── Empty cart ──────────────────────────────────── */}
        {cart.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "64px 20px",
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--border)"
          }}>
            <i className="bi bi-cart-x" style={{ fontSize: "3.5rem", color: "var(--text-muted)", marginBottom: 16, display: "block" }} />
            <p style={{ color: "var(--text-light)", marginBottom: 20, fontWeight: 600 }}>Your cart is empty</p>
            <Btn variant={isStaff ? "gold" : "primary"} onClick={() => setPage("menu")}>
              <i className="bi bi-grid" /> Browse Menu
            </Btn>
          </div>
        ) : (
          <>
            {/* ── Canteen selector ────────────────────────── */}
            <SectionCard>
              <SectionLabel icon="bi-shop">Canteen / Outlet</SectionLabel>
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

            {/* ── Order type ──────────────────────────────── */}
            <SectionCard>
              <SectionLabel icon="bi-signpost-2">Order Type</SectionLabel>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  ["pickup",   "bi-bag-check", "Pickup"],
                  ["delivery", "bi-truck",      "Campus Delivery"]
                ].map(([val, icon, label]) => (
                  <button
                    key={val}
                    onClick={() => setOType(val)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "11px 0",
                      border: `1.5px solid ${orderType === val ? (isStaff ? "var(--gold)" : "var(--primary)") : "var(--border)"}`,
                      borderRadius: 9,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: ".84rem",
                      background: orderType === val ? (isStaff ? "var(--gold-light)" : "var(--primary-light)") : "#fff",
                      color: orderType === val ? (isStaff ? "var(--gold)" : "var(--primary)") : "var(--text-light)",
                      transition: "all .15s"
                    }}
                  >
                    <i className={`bi ${icon}`} /> {label}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ── Delivery-only section ────────────────────── */}
            {orderType === "delivery" && (
              <>
                {/* Campus Location Picker / GPS mode */}
                <SectionCard>
                  <SectionLabel icon="bi-geo-alt-fill">
                    Delivery Location <span style={{ color: "var(--red)" }}>*</span>
                  </SectionLabel>

                  {!gpsMode ? (
                    /* Campus picker */
                    <CampusLocationPicker
                      selectedId={selectedCampusLocation?.id}
                      onSelect={handleSelectCampusLocation}
                      onUseGPS={handleUseGPS}
                      gpsLoading={locLoading}
                      isStaff={isStaff}
                    />
                  ) : (
                    /* GPS / manual mode */
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: isStaff ? "var(--gold)" : "var(--primary)" }}>
                          <i className="bi bi-broadcast-pin" style={{ marginRight: 4 }} />
                          GPS / Manual Entry Mode
                        </span>
                        <button
                          onClick={() => { setGpsMode(false); setAddress(""); setLat(null); setLng(null); }}
                          style={{
                            background: "none",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            cursor: "pointer"
                          }}
                        >
                          <i className="bi bi-arrow-left" style={{ marginRight: 4 }} />
                          Back to Location List
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={fetchCurrentLocation}
                        disabled={locLoading}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          padding: "10px 0",
                          borderRadius: 9,
                          border: `1.5px solid ${isStaff ? "var(--gold)" : "var(--primary)"}`,
                          background: isStaff ? "var(--gold-light)" : "var(--primary-light)",
                          color: isStaff ? "var(--gold)" : "var(--primary)",
                          fontWeight: 700,
                          fontSize: "0.84rem",
                          cursor: locLoading ? "wait" : "pointer",
                          marginBottom: 12
                        }}
                      >
                        {locLoading ? (
                          <>
                            <span style={{ width: 13, height: 13, border: "2px solid", borderTopColor: isStaff ? "var(--gold)" : "var(--primary)", borderRightColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "authSpin 0.75s linear infinite" }} />
                            Detecting location...
                          </>
                        ) : (
                          <><i className="bi bi-crosshair2" /> Detect My GPS Location</>
                        )}
                      </button>

                      {locError && (
                        <div style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--red)", fontSize: "0.74rem", fontWeight: 600, marginBottom: 10 }}>
                          <i className="bi bi-exclamation-triangle-fill" />
                          <span>{locError}</span>
                        </div>
                      )}

                      <textarea
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Type your delivery address (e.g. Block G, Room 10, Engineering Building)..."
                        className="form-input"
                        style={{ minHeight: 64, resize: "vertical", fontSize: "0.85rem", padding: "10px 12px" }}
                      />
                    </div>
                  )}

                  {/* Selected location confirmation banner */}
                  {address && !gpsMode && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 12,
                      padding: "10px 14px",
                      background: isStaff ? "rgba(212,175,55,0.1)" : "rgba(15,81,50,0.08)",
                      borderRadius: 9,
                      border: `1px solid ${isStaff ? "rgba(212,175,55,0.3)" : "rgba(15,81,50,0.2)"}`
                    }}>
                      <i className="bi bi-check-circle-fill" style={{ color: isStaff ? "var(--gold)" : "var(--primary)", fontSize: "1rem" }} />
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Delivering to</div>
                        <div style={{ fontWeight: 800, fontSize: "0.86rem", color: isStaff ? "var(--gold)" : "var(--primary)" }}>
                          {address}
                        </div>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Interactive Map */}
                <SectionCard>
                  <SectionLabel icon="bi-map">Location Preview</SectionLabel>
                  <div
                    id="delivery-map"
                    style={{
                      height: 220,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      overflow: "hidden",
                      position: "relative",
                      zIndex: 1
                    }}
                  />
                  <p style={{ fontSize: "0.68rem", color: "var(--text-light)", marginTop: 8, fontStyle: "italic", textAlign: "center" }}>
                    <i className="bi bi-info-circle" style={{ marginRight: 4 }} />
                    Drag the pin to fine-tune your exact delivery spot.
                  </p>
                </SectionCard>

                {/* Delivery notes */}
                <SectionCard>
                  <SectionLabel icon="bi-pencil-square">
                    Delivery Notes
                    <span style={{ fontWeight: 400, fontSize: "0.7rem", marginLeft: 4, color: "var(--text-muted)", textTransform: "none" }}>
                      (Optional)
                    </span>
                  </SectionLabel>
                  <textarea
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="E.g. Room 14 / Call me at gate / Leave with security / Ground floor..."
                    className="form-input"
                    style={{ minHeight: 72, resize: "vertical", fontSize: "0.85rem", padding: "10px 12px" }}
                  />
                </SectionCard>
              </>
            )}

            {/* ── Cart items ──────────────────────────────── */}
            <SectionCard>
              <SectionLabel icon="bi-list-ul">Items ({cartCount})</SectionLabel>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "11px 0",
                    borderBottom: "1px solid var(--border)"
                  }}
                >
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
                      <span style={{ fontWeight: 800, minWidth: 16, textAlign: "center", color: "var(--text-dark)" }}>
                        {item.qty}
                      </span>
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

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 16,
                fontWeight: 800,
                fontSize: "1rem",
                color: "var(--text-dark)"
              }}>
                <span>Order Total</span>
                <span style={{ color: isStaff ? "var(--gold)" : "var(--primary)" }}>
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>
            </SectionCard>

            {/* ── Place order CTA ─────────────────────────── */}
            <Btn
              full
              variant={isStaff ? "gold" : "primary"}
              onClick={handlePlaceOrder}
              style={{ padding: "14px 0", fontSize: ".95rem" }}
            >
              <i className="bi bi-check-circle-fill" />
              Place Order · ₦{cartTotal.toLocaleString()}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}
